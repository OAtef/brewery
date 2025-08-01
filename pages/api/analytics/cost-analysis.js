import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Get all orders with products and recipes for the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['COMPLETED', 'READY']
        }
      },
      include: {
        products: {
          include: {
            product: true,
            recipe: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true
                  }
                }
              }
            },
            packaging: true
          }
        }
      }
    });

    // Calculate cost analysis for each product
    const productCostAnalysis = {};
    let totalRevenue = 0;
    let totalCosts = 0;

    orders.forEach(order => {
      order.products.forEach(orderProduct => {
        const productName = orderProduct.product.name;
        const quantity = orderProduct.quantity;
        const unitPrice = orderProduct.unitPrice;
        const revenue = quantity * unitPrice;
        
        if (!productCostAnalysis[productName]) {
          productCostAnalysis[productName] = {
            name: productName,
            category: orderProduct.product.category,
            totalRevenue: 0,
            totalCosts: 0,
            totalQuantitySold: 0,
            averageSellingPrice: 0,
            ingredientCosts: 0,
            packagingCosts: 0,
            profitMargin: 0,
            profitPerUnit: 0
          };
        }

        // Add revenue
        productCostAnalysis[productName].totalRevenue += revenue;
        productCostAnalysis[productName].totalQuantitySold += quantity;
        totalRevenue += revenue;

        // Calculate ingredient costs
        let ingredientCost = 0;
        if (orderProduct.recipe && orderProduct.recipe.ingredients) {
          orderProduct.recipe.ingredients.forEach(recipeIngredient => {
            const ingredientUnitCost = recipeIngredient.ingredient.costPerUnit;
            const quantityUsed = recipeIngredient.quantity * quantity;
            ingredientCost += quantityUsed * ingredientUnitCost;
          });
        }

        // Calculate packaging costs
        const packagingCost = orderProduct.packaging.costPerUnit * quantity;
        
        const totalItemCost = ingredientCost + packagingCost;
        
        productCostAnalysis[productName].ingredientCosts += ingredientCost;
        productCostAnalysis[productName].packagingCosts += packagingCost;
        productCostAnalysis[productName].totalCosts += totalItemCost;
        totalCosts += totalItemCost;
      });
    });

    // Calculate derived metrics for each product
    const productAnalysisArray = Object.values(productCostAnalysis).map(product => {
      const averageSellingPrice = product.totalQuantitySold > 0 ? 
        product.totalRevenue / product.totalQuantitySold : 0;
      const averageCostPerUnit = product.totalQuantitySold > 0 ? 
        product.totalCosts / product.totalQuantitySold : 0;
      const profitPerUnit = averageSellingPrice - averageCostPerUnit;
      const profitMargin = averageSellingPrice > 0 ? 
        (profitPerUnit / averageSellingPrice) * 100 : 0;
      
      return {
        ...product,
        averageSellingPrice: Math.round(averageSellingPrice * 100) / 100,
        averageCostPerUnit: Math.round(averageCostPerUnit * 100) / 100,
        profitPerUnit: Math.round(profitPerUnit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalRevenue: Math.round(product.totalRevenue * 100) / 100,
        totalCosts: Math.round(product.totalCosts * 100) / 100,
        ingredientCosts: Math.round(product.ingredientCosts * 100) / 100,
        packagingCosts: Math.round(product.packagingCosts * 100) / 100
      };
    });

    // Sort by various metrics
    const mostProfitableProducts = [...productAnalysisArray]
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 5);

    const leastProfitableProducts = [...productAnalysisArray]
      .sort((a, b) => a.profitMargin - b.profitMargin)
      .slice(0, 5);

    const highestRevenueProducts = [...productAnalysisArray]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    const highestCostProducts = [...productAnalysisArray]
      .sort((a, b) => b.totalCosts - a.totalCosts)
      .slice(0, 5);

    // Calculate ingredient cost breakdown
    const ingredientCostBreakdown = {};
    orders.forEach(order => {
      order.products.forEach(orderProduct => {
        if (orderProduct.recipe && orderProduct.recipe.ingredients) {
          orderProduct.recipe.ingredients.forEach(recipeIngredient => {
            const ingredientName = recipeIngredient.ingredient.name;
            const cost = recipeIngredient.quantity * orderProduct.quantity * recipeIngredient.ingredient.costPerUnit;
            
            if (!ingredientCostBreakdown[ingredientName]) {
              ingredientCostBreakdown[ingredientName] = {
                name: ingredientName,
                totalCost: 0,
                totalQuantityUsed: 0,
                unit: recipeIngredient.ingredient.unit,
                costPerUnit: recipeIngredient.ingredient.costPerUnit
              };
            }
            
            ingredientCostBreakdown[ingredientName].totalCost += cost;
            ingredientCostBreakdown[ingredientName].totalQuantityUsed += 
              recipeIngredient.quantity * orderProduct.quantity;
          });
        }
      });
    });

    const ingredientCostArray = Object.values(ingredientCostBreakdown)
      .map(ingredient => ({
        ...ingredient,
        totalCost: Math.round(ingredient.totalCost * 100) / 100,
        totalQuantityUsed: Math.round(ingredient.totalQuantityUsed * 100) / 100
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    // Calculate overall metrics
    const overallProfitMargin = totalRevenue > 0 ? 
      ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    const totalProfit = totalRevenue - totalCosts;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Cost efficiency metrics
    const costEfficiencyMetrics = {
      ingredientCostPercentage: totalRevenue > 0 ? 
        (ingredientCostArray.reduce((sum, ing) => sum + ing.totalCost, 0) / totalRevenue) * 100 : 0,
      packagingCostPercentage: totalRevenue > 0 ? 
        (productAnalysisArray.reduce((sum, prod) => sum + prod.packagingCosts, 0) / totalRevenue) * 100 : 0,
      profitPerOrder: orders.length > 0 ? totalProfit / orders.length : 0,
      costPerOrder: orders.length > 0 ? totalCosts / orders.length : 0
    };

    // Recommendations
    const recommendations = [];
    
    // Low margin products
    leastProfitableProducts.forEach(product => {
      if (product.profitMargin < 30 && product.totalRevenue > 10) {
        recommendations.push({
          type: 'margin_improvement',
          product: product.name,
          message: `${product.name} has low profit margin (${product.profitMargin}%). Consider price adjustment or cost reduction.`,
          priority: product.profitMargin < 15 ? 'high' : 'medium',
          currentMargin: product.profitMargin,
          suggestedAction: 'Increase price or reduce ingredient costs'
        });
      }
    });

    // High cost ingredients
    ingredientCostArray.slice(0, 3).forEach(ingredient => {
      if (ingredient.totalCost > totalCosts * 0.15) { // More than 15% of total costs
        recommendations.push({
          type: 'cost_reduction',
          ingredient: ingredient.name,
          message: `${ingredient.name} accounts for ${Math.round((ingredient.totalCost / totalCosts) * 100)}% of total costs. Consider bulk purchasing or alternative suppliers.`,
          priority: 'medium',
          costImpact: ingredient.totalCost,
          suggestedAction: 'Negotiate better supplier rates or find alternatives'
        });
      }
    });

    res.status(200).json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCosts: Math.round(totalCosts * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        overallProfitMargin: Math.round(overallProfitMargin * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalOrders: orders.length,
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      },
      productAnalysis: productAnalysisArray,
      mostProfitableProducts,
      leastProfitableProducts,
      highestRevenueProducts,
      highestCostProducts,
      ingredientCostBreakdown: ingredientCostArray,
      costEfficiencyMetrics: {
        ingredientCostPercentage: Math.round(costEfficiencyMetrics.ingredientCostPercentage * 100) / 100,
        packagingCostPercentage: Math.round(costEfficiencyMetrics.packagingCostPercentage * 100) / 100,
        profitPerOrder: Math.round(costEfficiencyMetrics.profitPerOrder * 100) / 100,
        costPerOrder: Math.round(costEfficiencyMetrics.costPerOrder * 100) / 100
      },
      recommendations,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching cost analysis data:', error);
    res.status(500).json({ error: 'Failed to fetch cost analysis data' });
  }
}
