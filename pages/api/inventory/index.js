import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const ingredients = await prisma.ingredient.findMany({
        where: {
          isDeleted: false,
        },
      });
      return res.status(200).json(ingredients);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      return res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
