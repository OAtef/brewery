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
        ...orderData
      } = req.body;

      if (!clientData || !productsData || !orderData) {
        return res
          .status(400)
          .json({ error: "Client, products, and order data are required" });
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
          products: {
            create: productsData.map((p) => ({
              quantity: p.quantity,
              product: { connect: { id: p.productId } },
              packaging: { connect: { id: p.packagingId } },
            })),
          },
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
