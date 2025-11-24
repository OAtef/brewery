import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        if (req.method === "GET") {
            // Get a specific extra
            const extra = await prisma.extra.findUnique({
                where: { id: parseInt(id) },
                include: {
                    category: true,
                },
            });

            if (!extra) {
                return res.status(404).json({ error: "Extra not found" });
            }

            res.status(200).json(extra);
        } else if (req.method === "PUT") {
            // Update an extra
            const { name, price, categoryId } = req.body;

            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }

            const extra = await prisma.extra.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    price: price !== undefined ? parseFloat(price) : undefined,
                    category: categoryId ? { connect: { id: categoryId } } : undefined,
                },
                include: {
                    category: true,
                },
            });

            res.status(200).json(extra);
        } else if (req.method === "DELETE") {
            // Delete an extra
            // First check if this extra is used in any orders
            const orderCount = await prisma.orderProductExtra.count({
                where: { extraId: parseInt(id) },
            });

            if (orderCount > 0) {
                return res.status(400).json({
                    error: `Cannot delete extra that has been used in ${orderCount} order(s)`,
                });
            }

            // Delete extra ingredients first (if any)
            await prisma.extraIngredient.deleteMany({
                where: { extraId: parseInt(id) },
            });

            // Delete the extra
            await prisma.extra.delete({
                where: { id: parseInt(id) },
            });

            res.status(200).json({ message: "Extra deleted successfully" });
        } else {
            res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error("Extras API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
