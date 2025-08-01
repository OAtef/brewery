import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { period = 'today' } = req.query;
      
      let startDate, endDate = new Date();
      
      switch (period) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
      }

      // Get all ingredients with their waste data
      const ingredients = await prisma.ingredient.findMany({
        where: { isDeleted: false },
        include: {
          inventoryLogs: {
            where: {
              timestamp: {
                gte: startDate,
                lte: endDate
              },
              reason: {
                contains: 'waste',
                mode: 'insensitive'
              }
            },
            include: {
              user: true
            }
          },
          recipeIngredients: {
            include: {
              recipe: {
                include: {
                  product: {
                    include: {
                      orders: {
                        where: {
                          order: {
                            createdAt: {
                              gte: startDate,
                              lte: endDate
                            }
                          }
                        },
                        include: {
                          order: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Calculate waste data for each ingredient
      const wasteAnalysis = ingredients.map(ingredient => {
        // Calculate actual waste from inventory logs
        const actualWaste = ingredient.inventoryLogs.reduce((sum, log) => 
          sum + Math.abs(log.change), 0
        );

        // Calculate theoretical usage and waste
        let theoreticalUsage = 0;
        ingredient.recipeIngredients.forEach(recipeIngredient => {
          recipeIngredient.recipe.product.orders.forEach(orderProduct => {
            theoreticalUsage += recipeIngredient.quantity * orderProduct.quantity;
          });
        });

        const theoreticalWaste = theoreticalUsage * (ingredient.wastePercentage || 0.1); // Default 10% waste
        const wasteCost = actualWaste * ingredient.costPerUnit;
        
        // Calculate waste efficiency
        const wasteEfficiency = theoreticalWaste > 0 ? 
          Math.max(0, (1 - (actualWaste / theoreticalWaste)) * 100) : 100;

        return {
          id: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unit,
          actualWaste,
          theoreticalWaste: Math.round(theoreticalWaste * 100) / 100,
          wastePercentage: ingredient.wastePercentage || 0.1,
          wasteCost: Math.round(wasteCost * 100) / 100,
          costPerUnit: ingredient.costPerUnit,
          wasteEfficiency: Math.round(wasteEfficiency * 100) / 100,
          wasteEvents: ingredient.inventoryLogs.length,
          lastWasteDate: ingredient.inventoryLogs.length > 0 ? 
            ingredient.inventoryLogs[ingredient.inventoryLogs.length - 1].timestamp : null
        };
      });

      // Calculate summary statistics
      const totalWasteCost = wasteAnalysis.reduce((sum, item) => sum + item.wasteCost, 0);
      const totalWasteEvents = wasteAnalysis.reduce((sum, item) => sum + item.wasteEvents, 0);
      const averageWasteEfficiency = wasteAnalysis.length > 0 ? 
        wasteAnalysis.reduce((sum, item) => sum + item.wasteEfficiency, 0) / wasteAnalysis.length : 100;

      // Get worst performers (highest waste cost)
      const worstPerformers = wasteAnalysis
        .filter(item => item.wasteCost > 0)
        .sort((a, b) => b.wasteCost - a.wasteCost)
        .slice(0, 5);

      // Get best performers (highest efficiency)
      const bestPerformers = wasteAnalysis
        .filter(item => item.wasteEfficiency < 100)
        .sort((a, b) => b.wasteEfficiency - a.wasteEfficiency)
        .slice(0, 5);

      // Generate waste reduction recommendations
      const recommendations = [];
      
      worstPerformers.forEach(item => {
        if (item.wasteCost > 1) {
          recommendations.push({
            type: 'reduce_waste',
            ingredient: item.name,
            message: `High waste cost for ${item.name}: $${item.wasteCost}. Consider portion control training.`,
            priority: item.wasteCost > 5 ? 'high' : 'medium',
            estimatedSavings: item.wasteCost * 0.3 // 30% reduction potential
          });
        }
      });

      // Check for ingredients with very low efficiency
      wasteAnalysis.forEach(item => {
        if (item.wasteEfficiency < 70 && item.wasteEvents > 0) {
          recommendations.push({
            type: 'efficiency_improvement',
            ingredient: item.name,
            message: `Low efficiency for ${item.name}: ${item.wasteEfficiency}%. Review preparation procedures.`,
            priority: item.wasteEfficiency < 50 ? 'high' : 'medium',
            estimatedSavings: item.wasteCost * 0.4 // 40% reduction potential
          });
        }
      });

      // Get recent waste events
      const recentWasteEvents = await prisma.inventoryLog.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate
          },
          reason: {
            contains: 'waste',
            mode: 'insensitive'
          }
        },
        include: {
          ingredient: true,
          user: true
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      });

      const formattedWasteEvents = recentWasteEvents.map(event => ({
        id: event.id,
        ingredient: event.ingredient.name,
        amount: Math.abs(event.change),
        unit: event.ingredient.unit,
        cost: Math.abs(event.change) * event.ingredient.costPerUnit,
        reason: event.reason,
        timestamp: event.timestamp,
        user: event.user.name
      }));

      res.status(200).json({
        wasteAnalysis,
        summary: {
          totalWasteCost: Math.round(totalWasteCost * 100) / 100,
          totalWasteEvents,
          averageWasteEfficiency: Math.round(averageWasteEfficiency * 100) / 100,
          period,
          dateRange: {
            start: startDate,
            end: endDate
          }
        },
        worstPerformers,
        bestPerformers,
        recommendations,
        recentWasteEvents: formattedWasteEvents,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching waste data:', error);
      res.status(500).json({ error: 'Failed to fetch waste data' });
    }

  } else if (req.method === 'POST') {
    // Add a new waste entry
    try {
      const { ingredientId, amount, reason, userId = 1 } = req.body;

      if (!ingredientId || !amount || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create inventory log entry for waste
      const wasteEntry = await prisma.inventoryLog.create({
        data: {
          ingredientId: parseInt(ingredientId),
          change: -Math.abs(amount), // Negative for waste
          reason: `waste: ${reason}`,
          userId: parseInt(userId)
        },
        include: {
          ingredient: true,
          user: true
        }
      });

      // Update ingredient stock
      await prisma.ingredient.update({
        where: { id: parseInt(ingredientId) },
        data: {
          currentStock: {
            decrement: Math.abs(amount)
          }
        }
      });

      res.status(201).json({
        message: 'Waste entry created successfully',
        wasteEntry: {
          id: wasteEntry.id,
          ingredient: wasteEntry.ingredient.name,
          amount: Math.abs(wasteEntry.change),
          unit: wasteEntry.ingredient.unit,
          cost: Math.abs(wasteEntry.change) * wasteEntry.ingredient.costPerUnit,
          reason: wasteEntry.reason,
          timestamp: wasteEntry.timestamp,
          user: wasteEntry.user.name
        }
      });

    } catch (error) {
      console.error('Error creating waste entry:', error);
      res.status(500).json({ error: 'Failed to create waste entry' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
