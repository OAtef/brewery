import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      // Get a specific product with its recipes, ingredients, category, and variants
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
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
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json(product);
    } else if (req.method === "PUT") {
      // Update a product
      const { name, category, description, basePrice, variantGroups } = req.body;

      // Handle Category update
      let categoryConnect = undefined;
      if (typeof category === 'number') {
        categoryConnect = { connect: { id: category } };
      } else if (typeof category === 'string') {
        categoryConnect = {
          connectOrCreate: {
            where: { name: category },
            create: { name: category },
          }
        };
      }

      // Prepare update data
      const updateData = {
        name,
        description,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        category: categoryConnect,
        categoryName: typeof category === 'string' ? category : undefined,
      };

      // If variantGroups provided, we need to handle them.
      // For simplicity, if variantGroups are sent, we'll replace the existing ones.
      // This is a "destructive" update for variants but simplest for now.
      if (variantGroups) {
        // First delete existing variant groups (and their options via cascade if configured, but we might need to be explicit)
        // Prisma cascade delete should handle options if configured in schema or we delete manually.
        // Our schema doesn't explicitly say onDelete: Cascade, so we should delete manually to be safe.

        // Find existing groups
        const existingGroups = await prisma.variantGroup.findMany({
          where: { productId: parseInt(id) }
        });

        // Delete options for existing groups
        for (const group of existingGroups) {
          await prisma.variantOption.deleteMany({
            where: { variantGroupId: group.id }
          });
        }

        // Delete groups
        await prisma.variantGroup.deleteMany({
          where: { productId: parseInt(id) }
        });

        // Add new ones
        updateData.variantGroups = {
          create: variantGroups.map(group => ({
            name: group.name,
            options: {
              create: group.options.map(option => ({
                name: option.name,
                priceAdjustment: parseFloat(option.priceAdjustment || 0),
              }))
            }
          }))
        };
      }

      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData,
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
      });

      res.status(200).json(product);
    } else if (req.method === "DELETE") {
      // Delete a product (only if no sales exist)
      const salesCount = await prisma.sale.count({
        where: { productId: parseInt(id) },
      });

      if (salesCount > 0) {
        return res.status(400).json({
          error: "Cannot delete product with existing sales records"
        });
      }

      // Delete all recipe ingredients first
      await prisma.recipeIngredient.deleteMany({
        where: {
          recipe: {
            productId: parseInt(id),
          },
        },
      });

      // Delete all recipes
      await prisma.recipe.deleteMany({
        where: { productId: parseInt(id) },
      });

      // Delete variant options and groups
      const existingGroups = await prisma.variantGroup.findMany({
        where: { productId: parseInt(id) }
      });

      for (const group of existingGroups) {
        await prisma.variantOption.deleteMany({
          where: { variantGroupId: group.id }
        });
      }

      await prisma.variantGroup.deleteMany({
        where: { productId: parseInt(id) }
      });

      // Delete the product
      await prisma.product.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Product API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
