import prisma from "../../../lib/prisma";

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
        ...orderData
      } = req.body;

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          ...orderData,
          client: clientData ? { connect: { id: clientData.id } } : undefined,
          products: productsData
            ? {
                deleteMany: {},
                create: productsData.map((p) => ({
                  quantity: p.quantity,
                  product: { connect: { id: p.productId } },
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
              packaging: true,
            },
          },
        },
      });

      res.status(200).json(updatedOrder);
    } else if (req.method === "DELETE") {
      // Delete an order
      await prisma.orderProduct.deleteMany({
        where: { orderId: parseInt(id) },
      });
      await prisma.order.delete({
        where: { id: parseInt(id) },
      });

      res.status(204).end();
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error(`Order ${id} API error:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
}
