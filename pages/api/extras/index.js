import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            // Get all extras
            const extras = await prisma.extra.findMany({
                include: {
                    category: true,
                },
                orderBy: {
                    name: "asc",
                },
            });

            res.status(200).json({ extras });
        } else if (req.method === "POST") {
            // Create a new extra
            const { name, price, categoryId } = req.body;

            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }

            const extra = await prisma.extra.create({
                data: {
                    name,
                    price: parseFloat(price || 0),
                    category: categoryId ? { connect: { id: categoryId } } : undefined,
                },
                include: {
                    category: true,
                },
            });

            res.status(201).json(extra);
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error("Extras API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
