import prisma from "../../../lib/prisma";
import { calculateRecipeCost, PRICING_CONFIG } from "../../../lib/pricing";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Get all products with their recipes and ingredients
      const products = await prisma.product.findMany({
        include: {
          recipes: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Calculate real-time pricing for each recipe
      const productsWithPricing = products.map(product => {
        const recipesWithPricing = product.recipes.map(recipe => {
          // Only calculate pricing for recipes with ingredients
          if (recipe.ingredients.length > 0) {
            const category = product.category.toLowerCase();
            const pricingOptions = PRICING_CONFIG[category] || PRICING_CONFIG.coffee;
            
            const costBreakdown = calculateRecipeCost(recipe.ingredients, pricingOptions);
            const finalPrice = costBreakdown.sellingPrice + (recipe.priceModifier || 0);

            return {
              ...recipe,
              calculatedPrice: Math.round(finalPrice * 100) / 100,
              costBreakdown: {
                ingredientCost: costBreakdown.ingredientCost,
                laborCost: costBreakdown.laborCost,
                totalCost: costBreakdown.baseCost,
                profitMargin: costBreakdown.profitMargin,
              },
            };
          } else {
            // For recipes without ingredients (retail items), use base price
            return {
              ...recipe,
              calculatedPrice: product.basePrice + (recipe.priceModifier || 0),
              costBreakdown: null,
            };
          }
        });

        return {
          ...product,
          recipes: recipesWithPricing,
        };
      });

      res.status(200).json(productsWithPricing);
    } else if (req.method === "POST") {
      // Create a new product
      const { name, category, description, basePrice = 0 } = req.body;

      if (!name || !category) {
        return res
          .status(400)
          .json({ error: "Name and category are required" });
      }

      const product = await prisma.product.create({
        data: {
          name,
          category,
          description,
          basePrice,
        },
        include: {
          recipes: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json(product);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Products API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
