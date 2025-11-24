import prisma from "../../../lib/prisma";
import { calculateRecipeCost, PRICING_CONFIG } from "../../../lib/pricing";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      console.log('[API] GET /api/products request received');
      // Disable caching to ensure fresh data
      res.setHeader('Cache-Control', 'no-store, max-age=0');

      // Get all products with their recipes, ingredients, category, and variants
      const products = await prisma.product.findMany({
        include: {
          category: true,
          variantGroups: {
            include: {
              options: true,
            },
          },
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
            // Use category name from relation or fallback to string/default
            const categoryName = product.category?.name || product.categoryName || 'coffee';
            const categoryKey = categoryName.toLowerCase();
            const pricingOptions = PRICING_CONFIG[categoryKey] || PRICING_CONFIG.coffee;

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
      const { name, category, description, basePrice = 0, variantGroups = [] } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ error: "Name is required" });
      }

      // Handle Category:
      // 1. If category is an ID (int), connect it.
      // 2. If category is a String, try to find it or create it (or fail if strict).
      // For simplicity, let's assume if it's a string, we try to findByName or create.

      let categoryConnect = {};
      if (typeof category === 'number') {
        categoryConnect = { connect: { id: category } };
      } else if (typeof category === 'string') {
        // Try to find existing category by name, or create if not exists
        // Note: upsert requires a unique constraint on name, which we added.
        categoryConnect = {
          connectOrCreate: {
            where: { name: category },
            create: { name: category },
          }
        };
      }

      const productData = {
        name,
        description,
        basePrice: parseFloat(basePrice),
        category: categoryConnect,
        categoryName: typeof category === 'string' ? category : undefined, // Keep sync
        variantGroups: {
          create: variantGroups.map(group => ({
            name: group.name,
            options: {
              create: group.options.map(option => ({
                name: option.name,
                priceAdjustment: parseFloat(option.priceAdjustment || 0),
              }))
            }
          }))
        }
      };

      const product = await prisma.product.create({
        data: productData,
        include: {
          category: true,
          variantGroups: {
            include: {
              options: true
            }
          },
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
