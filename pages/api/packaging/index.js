import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Get all packaging options
      const packaging = await prisma.packaging.findMany({
        orderBy: {
          type: "asc",
        },
      });

      res.status(200).json(packaging);
    } else if (req.method === "POST") {
      // Create a new packaging option
      const { type, costPerUnit, currentStock } = req.body;

      if (!type || costPerUnit === undefined || currentStock === undefined) {
        return res
          .status(400)
          .json({ error: "Type, costPerUnit, and currentStock are required" });
      }

      const packaging = await prisma.packaging.create({
        data: {
          type,
          costPerUnit,
          currentStock,
        },
      });

      res.status(201).json(packaging);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Packaging API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
