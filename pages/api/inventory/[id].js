import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const ingredientId = parseInt(id, 10);

      // Check if the ingredient is used in any product recipes
      const recipeIngredients = await prisma.recipeIngredient.findMany({
        where: {
          ingredientId: ingredientId,
        },
      });

      if (recipeIngredients.length > 0) {
        return res.status(400).json({
          message:
            "This ingredient is used in products and cannot be deleted. Please remove it from all products before deleting.",
        });
      }

      // Mark the ingredient as deleted
      await prisma.ingredient.update({
        where: {
          id: ingredientId,
        },
        data: {
          isDeleted: true,
        },
      });

      res.status(200).json({ message: "Ingredient deleted successfully" });
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
      res.status(500).json({ message: "Failed to delete ingredient" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
