import prisma from "../../../lib/prisma";

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

      res.status(200).json(products);
    } else if (req.method === "POST") {
      // Create a new product
      const { name, category } = req.body;

      if (!name || !category) {
        return res
          .status(400)
          .json({ error: "Name and category are required" });
      }

      const product = await prisma.product.create({
        data: {
          name,
          category,
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
