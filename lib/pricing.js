/**
 * Pricing Calculation Utilities
 * 
 * This module handles all pricing calculations based on ingredient costs,
 * markup percentages, and other factors for realistic cost management.
 */

/**
 * Calculate the cost of a recipe based on its ingredients
 * @param {Array} recipeIngredients - Array of recipe ingredients with quantities
 * @param {Object} options - Pricing options
 * @returns {Object} - Cost breakdown and final price
 */
export function calculateRecipeCost(recipeIngredients, options = {}) {
  const {
    markupPercentage = 150, // Default 150% markup (cost × 2.5)
    laborCostPerMinute = 0.25, // $0.25 per minute labor
    preparationTime = 3, // Default 3 minutes preparation
    overheadPercentage = 20, // 20% overhead (rent, utilities, etc.)
  } = options;

  // Calculate raw ingredient cost
  const ingredientCost = recipeIngredients.reduce((total, recipeIngredient) => {
    const { ingredient, quantity } = recipeIngredient;
    const ingredientCostWithWaste = ingredient.costPerUnit * (1 + ingredient.wastePercentage);
    return total + (ingredientCostWithWaste * quantity);
  }, 0);

  // Calculate labor cost
  const laborCost = laborCostPerMinute * preparationTime;

  // Calculate base cost (ingredients + labor)
  const baseCost = ingredientCost + laborCost;

  // Add overhead
  const costWithOverhead = baseCost * (1 + overheadPercentage / 100);

  // Apply markup to get selling price
  const sellingPrice = costWithOverhead * (1 + markupPercentage / 100);

  // Calculate profit margin
  const profit = sellingPrice - baseCost;
  const profitMargin = (profit / sellingPrice) * 100;

  return {
    ingredientCost: Math.round(ingredientCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    baseCost: Math.round(baseCost * 100) / 100,
    costWithOverhead: Math.round(costWithOverhead * 100) / 100,
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
    breakdown: {
      ingredients: recipeIngredients.map(ri => ({
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.ingredient.unit,
        costPerUnit: ri.ingredient.costPerUnit,
        totalCost: Math.round(ri.ingredient.costPerUnit * ri.quantity * 100) / 100,
      })),
    },
  };
}

/**
 * Calculate final product price including variant modifiers and packaging
 * @param {Object} recipe - Recipe with ingredients
 * @param {Object} packaging - Packaging information
 * @param {Object} options - Pricing options
 * @returns {Number} - Final price
 */
export function calculateFinalPrice(recipe, packaging = null, options = {}) {
  const recipeCost = calculateRecipeCost(recipe.ingredients, options);
  
  // Add variant price modifier
  let finalPrice = recipeCost.sellingPrice + (recipe.priceModifier || 0);
  
  // Add packaging cost if provided
  if (packaging) {
    const packagingMarkup = packaging.costPerUnit * 2; // 100% markup on packaging
    finalPrice += packagingMarkup;
  }
  
  return Math.round(finalPrice * 100) / 100;
}

/**
 * Get pricing options for different drink sizes
 * @param {String} size - small, medium, large
 * @returns {Object} - Pricing options for the size
 */
export function getPricingOptionsBySize(size = 'medium') {
  const sizePricing = {
    small: {
      markupPercentage: 140,
      preparationTime: 2.5,
    },
    medium: {
      markupPercentage: 150,
      preparationTime: 3,
    },
    large: {
      markupPercentage: 160,
      preparationTime: 3.5,
    },
  };
  
  return {
    markupPercentage: 150,
    laborCostPerMinute: 0.25,
    preparationTime: 3,
    overheadPercentage: 20,
    ...sizePricing[size],
  };
}

/**
 * Calculate break-even analysis for a product
 * @param {Object} recipe - Recipe with ingredients
 * @param {Number} fixedCostsPerMonth - Monthly fixed costs allocated to this product
 * @param {Number} expectedSalesPerMonth - Expected monthly sales volume
 * @returns {Object} - Break-even analysis
 */
export function calculateBreakEven(recipe, fixedCostsPerMonth, expectedSalesPerMonth) {
  const recipeCost = calculateRecipeCost(recipe.ingredients);
  const fixedCostPerUnit = fixedCostsPerMonth / expectedSalesPerMonth;
  const totalCostPerUnit = recipeCost.baseCost + fixedCostPerUnit;
  const minimumSellingPrice = totalCostPerUnit * 1.1; // 10% minimum profit
  
  return {
    variableCostPerUnit: recipeCost.baseCost,
    fixedCostPerUnit: Math.round(fixedCostPerUnit * 100) / 100,
    totalCostPerUnit: Math.round(totalCostPerUnit * 100) / 100,
    minimumSellingPrice: Math.round(minimumSellingPrice * 100) / 100,
    currentSellingPrice: recipeCost.sellingPrice,
    profitPerUnit: Math.round((recipeCost.sellingPrice - totalCostPerUnit) * 100) / 100,
  };
}

/**
 * Default pricing configuration for different product categories
 */
export const PRICING_CONFIG = {
  espresso: {
    markupPercentage: 180, // Higher markup for espresso-based drinks
    preparationTime: 2,
    overheadPercentage: 25,
  },
  coffee: {
    markupPercentage: 150,
    preparationTime: 1.5,
    overheadPercentage: 20,
  },
  specialty: {
    markupPercentage: 200, // Premium for specialty drinks
    preparationTime: 4,
    overheadPercentage: 30,
  },
  retail: {
    markupPercentage: 100, // Lower markup for retail items
    preparationTime: 0.5,
    overheadPercentage: 15,
  },
};
