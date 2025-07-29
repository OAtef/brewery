/**
 * Stock Management Service
 * Handles automatic stock adjustments based on order status changes
 */

import prisma from "./prisma";

// Order statuses that consume ingredients (reduce stock)
const STOCK_CONSUMING_STATUSES = ['PREPARING', 'READY', 'COMPLETED'];

// Order statuses that return ingredients (increase stock) 
const STOCK_RETURNING_STATUSES = ['CANCELLED'];

/**
 * Calculate ingredient consumption for an order
 * @param {Object} order - Order with products and recipes
 * @returns {Array} Array of {ingredientId, totalQuantity} objects
 */
export async function calculateIngredientConsumption(order) {
  const ingredientConsumption = new Map();

  // Get order with all necessary relations
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
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
          }
        }
      }
    }
  });

  if (!fullOrder) {
    throw new Error(`Order ${order.id} not found`);
  }

  // Calculate total ingredient consumption across all order products
  for (const orderProduct of fullOrder.products) {
    const { quantity, recipe } = orderProduct;
    
    if (recipe && recipe.ingredients) {
      // For each ingredient in the recipe
      for (const recipeIngredient of recipe.ingredients) {
        const ingredientId = recipeIngredient.ingredientId;
        const consumptionPerUnit = recipeIngredient.quantity;
        const totalConsumption = consumptionPerUnit * quantity;

        // Add to total consumption for this ingredient
        const currentTotal = ingredientConsumption.get(ingredientId) || 0;
        ingredientConsumption.set(ingredientId, currentTotal + totalConsumption);
      }
    }
  }

  // Convert map to array format
  return Array.from(ingredientConsumption.entries()).map(([ingredientId, totalQuantity]) => ({
    ingredientId: parseInt(ingredientId),
    totalQuantity
  }));
}

/**
 * Adjust ingredient stock levels
 * @param {Array} ingredientConsumption - Array of {ingredientId, totalQuantity}
 * @param {String} operation - 'CONSUME' or 'RETURN'
 * @param {Number} orderId - Order ID for logging
 * @param {Number} userId - User ID for logging
 */
export async function adjustIngredientStock(ingredientConsumption, operation, orderId, userId) {
  const isConsume = operation === 'CONSUME';
  const logReason = isConsume 
    ? `Order ${orderId} status changed to stock-consuming status`
    : `Order ${orderId} was cancelled - returning ingredients to stock`;

  for (const { ingredientId, totalQuantity } of ingredientConsumption) {
    // Calculate stock change (negative for consumption, positive for return)
    const stockChange = isConsume ? -totalQuantity : totalQuantity;

    try {
      // Update ingredient stock using a transaction to ensure consistency
      await prisma.$transaction(async (prismaTransaction) => {
        // Get current ingredient info
        const ingredient = await prismaTransaction.ingredient.findUnique({
          where: { id: ingredientId }
        });

        if (!ingredient) {
          throw new Error(`Ingredient ${ingredientId} not found`);
        }

        // Check if we have enough stock for consumption
        if (isConsume && ingredient.currentStock < totalQuantity) {
          console.warn(`Insufficient stock for ingredient ${ingredient.name}. Required: ${totalQuantity}, Available: ${ingredient.currentStock}`);
          // Continue anyway but log the warning - you might want to handle this differently
        }

        // Update ingredient stock
        await prismaTransaction.ingredient.update({
          where: { id: ingredientId },
          data: {
            currentStock: {
              increment: stockChange
            }
          }
        });

        // Create inventory log entry
        await prismaTransaction.inventoryLog.create({
          data: {
            ingredientId,
            change: stockChange,
            reason: logReason,
            userId
          }
        });
      });

      console.log(`✅ Stock adjusted for ingredient ${ingredientId}: ${stockChange > 0 ? '+' : ''}${stockChange}`);
    } catch (error) {
      console.error(`❌ Failed to adjust stock for ingredient ${ingredientId}:`, error);
      throw error;
    }
  }
}

/**
 * Handle order status change and adjust stock accordingly
 * @param {Number} orderId - Order ID
 * @param {String} oldStatus - Previous order status
 * @param {String} newStatus - New order status
 * @param {Number} userId - User making the change
 */
export async function handleOrderStatusStockAdjustment(orderId, oldStatus, newStatus, userId) {
  try {
    console.log(`🔄 Processing stock adjustment for order ${orderId}: ${oldStatus} → ${newStatus}`);

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Calculate ingredient consumption for this order
    const ingredientConsumption = await calculateIngredientConsumption(order);
    
    if (ingredientConsumption.length === 0) {
      console.log(`📝 No ingredients to adjust for order ${orderId} (no recipes with ingredients)`);
      return;
    }

    const wasConsuming = STOCK_CONSUMING_STATUSES.includes(oldStatus);
    const isConsuming = STOCK_CONSUMING_STATUSES.includes(newStatus);
    const isReturning = STOCK_RETURNING_STATUSES.includes(newStatus);

    // Determine what stock adjustment to make
    if (!wasConsuming && isConsuming) {
      // Order is now consuming stock - reduce ingredient quantities
      console.log(`📉 Order ${orderId} is now consuming stock`);
      await adjustIngredientStock(ingredientConsumption, 'CONSUME', orderId, userId);
    } else if (wasConsuming && isReturning) {
      // Order was consuming but now cancelled - return ingredients
      console.log(`📈 Order ${orderId} cancelled - returning stock`);
      await adjustIngredientStock(ingredientConsumption, 'RETURN', orderId, userId);
    } else if (wasConsuming && !isConsuming && !isReturning) {
      // Order moved from consuming to non-consuming status (unusual case)
      console.log(`📈 Order ${orderId} moved from consuming to non-consuming status - returning stock`);
      await adjustIngredientStock(ingredientConsumption, 'RETURN', orderId, userId);
    }
    // No stock adjustment needed for other transitions

    console.log(`✅ Stock adjustment completed for order ${orderId}`);
  } catch (error) {
    console.error(`❌ Stock adjustment failed for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Check if a status change requires stock adjustment
 * @param {String} oldStatus - Previous status
 * @param {String} newStatus - New status
 * @returns {Boolean} Whether stock adjustment is needed
 */
export function requiresStockAdjustment(oldStatus, newStatus) {
  const wasConsuming = STOCK_CONSUMING_STATUSES.includes(oldStatus);
  const isConsuming = STOCK_CONSUMING_STATUSES.includes(newStatus);
  const isReturning = STOCK_RETURNING_STATUSES.includes(newStatus);

  return (!wasConsuming && isConsuming) || 
         (wasConsuming && isReturning) || 
         (wasConsuming && !isConsuming && !isReturning);
}
