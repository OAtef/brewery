import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { orderIds, status, dateFrom, dateTo } = req.body;

        let whereCondition = {};

        // Build where condition based on parameters
        if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
            // Delete specific order IDs
            whereCondition.id = { in: orderIds.map(id => parseInt(id)) };
        } else if (status || dateFrom || dateTo) {
            // Delete by status and/or date range
            if (status) {
                whereCondition.status = status;
            }
            if (dateFrom || dateTo) {
                whereCondition.createdAt = {};
                if (dateFrom) {
                    whereCondition.createdAt.gte = new Date(dateFrom);
                }
                if (dateTo) {
                    // Include the entire end date
                    const endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999);
                    whereCondition.createdAt.lte = endDate;
                }
            }
        } else {
            return res.status(400).json({
                error: "Please provide orderIds, status, or date range"
            });
        }

        // Get all orders matching the criteria
        const ordersToDelete = await prisma.order.findMany({
            where: whereCondition,
            select: {
                id: true,
                products: {
                    select: { id: true }
                }
            }
        });

        if (ordersToDelete.length === 0) {
            return res.status(200).json({
                message: "No orders found matching criteria",
                deletedCount: 0
            });
        }

        // Delete variants and extras for all order products
        const orderProductIds = ordersToDelete.flatMap(order =>
            order.products.map(p => p.id)
        );

        await prisma.orderProductVariant.deleteMany({
            where: { orderProductId: { in: orderProductIds } }
        });

        await prisma.orderProductExtra.deleteMany({
            where: { orderProductId: { in: orderProductIds } }
        });

        // Delete order products
        await prisma.orderProduct.deleteMany({
            where: {
                orderId: { in: ordersToDelete.map(o => o.id) }
            }
        });

        // Delete orders
        const result = await prisma.order.deleteMany({
            where: whereCondition
        });

        res.status(200).json({
            message: `Successfully deleted ${result.count} order(s)`,
            deletedCount: result.count
        });

    } catch (error) {
        console.error("Bulk delete orders API error:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
}
