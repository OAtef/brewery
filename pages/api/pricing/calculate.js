import prisma from "../../../lib/prisma";
import { calculateRecipeCost, calculateFinalPrice, PRICING_CONFIG } from "../../../lib/pricing";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { recipeId, packagingId } = req.query;

  try {
    // Get recipe with full ingredient details
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(recipeId) },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        product: true,
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Get packaging if specified
    let packaging = null;
    if (packagingId) {
      packaging = await prisma.packaging.findUnique({
        where: { id: parseInt(packagingId) },
      });
    }

    // Determine pricing config based on product category
    const category = recipe.product.category.toLowerCase();
    const pricingOptions = PRICING_CONFIG[category] || PRICING_CONFIG.coffee;

    // Calculate costs
    const costBreakdown = calculateRecipeCost(recipe.ingredients, pricingOptions);
    const finalPrice = calculateFinalPrice(recipe, packaging, pricingOptions);

    // Prepare response
    const response = {
      recipe: {
        id: recipe.id,
        productName: recipe.product.name,
        variant: recipe.variant,
        category: recipe.product.category,
      },
      pricing: {
        ingredientCost: costBreakdown.ingredientCost,
        laborCost: costBreakdown.laborCost,
        baseCost: costBreakdown.baseCost,
        costWithOverhead: costBreakdown.costWithOverhead,
        sellingPrice: costBreakdown.sellingPrice,
        variantModifier: recipe.priceModifier,
        packagingCost: packaging ? packaging.costPerUnit * 2 : 0,
        finalPrice: finalPrice,
        profit: costBreakdown.profit,
        profitMargin: costBreakdown.profitMargin,
      },
      breakdown: costBreakdown.breakdown,
      packaging: packaging ? {
        id: packaging.id,
        type: packaging.type,
        cost: packaging.costPerUnit,
        markupCost: packaging.costPerUnit * 2,
      } : null,
      pricingConfig: pricingOptions,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Pricing calculation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
