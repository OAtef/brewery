import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all ingredients with their current stock and usage
    const ingredients = await prisma.ingredient.findMany({
      where: { isDeleted: false },
      include: {
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
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
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

    // Calculate stock levels and usage for each ingredient
    const stockAnalysis = ingredients.map(ingredient => {
      // Calculate total usage in last 7 days
      let weeklyUsage = 0;
      ingredient.recipeIngredients.forEach(recipeIngredient => {
        recipeIngredient.recipe.product.orders.forEach(orderProduct => {
          weeklyUsage += recipeIngredient.quantity * orderProduct.quantity;
        });
      });

      // Calculate daily average usage
      const dailyUsage = weeklyUsage / 7;
      
      // Calculate days until stock runs out
      const daysUntilEmpty = dailyUsage > 0 ? Math.floor(ingredient.currentStock / dailyUsage) : 999;
      
      // Determine stock level status
      let status = 'good';
      let urgency = 'low';
      
      if (daysUntilEmpty <= 2) {
        status = 'critical';
        urgency = 'high';
      } else if (daysUntilEmpty <= 5) {
        status = 'low';
        urgency = 'medium';
      } else if (daysUntilEmpty <= 10) {
        status = 'warning';
        urgency = 'low';
      }

      return {
        id: ingredient.id,
        name: ingredient.name,
        currentStock: ingredient.currentStock,
        unit: ingredient.unit,
        weeklyUsage: Math.round(weeklyUsage * 100) / 100,
        dailyUsage: Math.round(dailyUsage * 100) / 100,
        daysUntilEmpty,
        status,
        urgency,
        suggestedReorderAmount: Math.ceil(dailyUsage * 14), // 2 weeks supply
        cost: ingredient.costPerUnit || 0
      };
    });

    // Filter and sort by urgency
    const lowStockItems = stockAnalysis
      .filter(item => item.status !== 'good')
      .sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });

    // Calculate summary statistics
    const summary = {
      totalItems: stockAnalysis.length,
      criticalItems: stockAnalysis.filter(item => item.status === 'critical').length,
      lowStockItems: stockAnalysis.filter(item => item.status === 'low').length,
      warningItems: stockAnalysis.filter(item => item.status === 'warning').length,
      totalReorderCost: lowStockItems.reduce((sum, item) => 
        sum + (item.suggestedReorderAmount * item.cost), 0
      )
    };

    // Get recent stock movements from inventory logs
    const recentMovements = await prisma.inventoryLog.findMany({
      include: {
        ingredient: true,
        user: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });

    const formattedMovements = recentMovements.map(log => ({
      ingredient: log.ingredient.name,
      change: log.change,
      reason: log.reason,
      timestamp: log.timestamp,
      user: log.user.name
    }));

    res.status(200).json({
      lowStockItems,
      allItems: stockAnalysis,
      summary,
      recentMovements: formattedMovements,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching low stock data:', error);
    res.status(500).json({ error: 'Failed to fetch low stock data' });
  }
}
