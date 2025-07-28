import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      // Get a single packaging option by id
      const packaging = await prisma.packaging.findUnique({
        where: { id: parseInt(id) },
      });

      if (!packaging) {
        return res.status(404).json({ error: "Packaging not found" });
      }

      res.status(200).json(packaging);
    } else if (req.method === "PUT") {
      // Update a packaging option
      const { type, costPerUnit, currentStock } = req.body;

      const updatedPackaging = await prisma.packaging.update({
        where: { id: parseInt(id) },
        data: {
          type,
          costPerUnit,
          currentStock,
        },
      });

      res.status(200).json(updatedPackaging);
    } else if (req.method === "DELETE") {
      // Delete a packaging option
      await prisma.packaging.delete({
        where: { id: parseInt(id) },
      });

      res.status(204).end();
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error(`Packaging ${id} API error:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
}
