import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { name } = req.query;

    try {
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

      if (ingredient) {
        res.status(200).json({ exists: true });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to check ingredient name" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
