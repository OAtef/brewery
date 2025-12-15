import prisma from "../../../lib/prisma";
import { handleOrderStatusStockAdjustment, requiresStockAdjustment } from "../../../lib/stockManagement";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      // Get a single order by id
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          client: true,
          products: {
            include: {
              product: true,
              recipe: true,
              packaging: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(200).json(order);
    } else if (req.method === "PUT") {
      // Update an order
      const {
        client: clientData,
        products: productsData,
        status: newStatus,
        ...orderData
      } = req.body;

      // Get current order to check for status changes
      const currentOrder = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        select: { status: true, userId: true }
      });

      if (!currentOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      const oldStatus = currentOrder.status;

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          ...orderData,
          status: newStatus,
          client: clientData ? { connect: { id: clientData.id } } : undefined,
          products: productsData
            ? {
                deleteMany: {},
                create: productsData.map((p) => ({
                  quantity: p.quantity,
                  unitPrice: p.unitPrice,
                  product: { connect: { id: p.productId } },
                  recipe: p.recipeId ? { connect: { id: p.recipeId } } : undefined,
                  packaging: { connect: { id: p.packagingId } },
                })),
              }
            : undefined,
        },
        include: {
          client: true,
          products: {
            include: {
              product: true,
              recipe: true,
              packaging: true,
            },
          },
        },
      });

      // Handle stock adjustments if status changed
      if (newStatus && oldStatus !== newStatus && requiresStockAdjustment(oldStatus, newStatus)) {
        try {
          console.log(`🔄 Processing stock adjustment for order ${id}: ${oldStatus} → ${newStatus}`);
          await handleOrderStatusStockAdjustment(
            parseInt(id), 
            oldStatus, 
            newStatus, 
            currentOrder.userId
          );
          console.log(`✅ Stock adjustment completed for order ${id}`);
        } catch (stockError) {
          console.error(`❌ Stock adjustment failed for order ${id}:`, stockError);
          // Log the error but don't fail the order update
          // You might want to implement a retry mechanism or manual intervention here
        }
      }

      res.status(200).json(updatedOrder);
    } else if (req.method === "DELETE") {
      // Delete an order
      // First, get all order products
      const orderProducts = await prisma.orderProduct.findMany({
        where: { orderId: parseInt(id) },
        select: { id: true }
      });

      // Delete related variants and extras for each order product
      for (const orderProduct of orderProducts) {
        await prisma.orderProductVariant.deleteMany({
          where: { orderProductId: orderProduct.id }
        });
        await prisma.orderProductExtra.deleteMany({
          where: { orderProductId: orderProduct.id }
        });
      }

      // Delete order products
      await prisma.orderProduct.deleteMany({
        where: { orderId: parseInt(id) },
      });

      // Delete the order
      await prisma.order.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Order deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error(`Order ${id} API error:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
}
