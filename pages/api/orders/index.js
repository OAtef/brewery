import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Get all orders with their products and client
      const orders = await prisma.order.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(orders);
    } else if (req.method === "POST") {
      // Create a new order
      const {
        client: clientData,
        products: productsData,
        userId,
        ...orderData
      } = req.body;

      if (!clientData || !productsData || !userId || !orderData) {
        return res
          .status(400)
          .json({ error: "Client, products, userId, and order data are required" });
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid user ID" });
      }

      let client = await prisma.client.findUnique({
        where: { client_number: clientData.client_number },
      });

      if (!client) {
        client = await prisma.client.create({
          data: clientData,
        });
      }

      const order = await prisma.order.create({
        data: {
          ...orderData,
          client: {
            connect: { id: client.id },
          },
          user: {
            connect: { id: userId },
          },
          products: {
            create: productsData.map((p) => ({
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              product: { connect: { id: p.productId } },
              recipe: p.recipeId ? { connect: { id: p.recipeId } } : undefined,
              packaging: { connect: { id: p.packagingId } },
            })),
          },
        },
        include: {
          client: true,
          user: true,
          products: {
            include: {
              product: true,
              recipe: true,
              packaging: true,
            },
          },
        },
      });

      res.status(201).json(order);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Orders API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
