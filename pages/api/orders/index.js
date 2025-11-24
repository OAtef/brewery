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
        application,
        total,
        ...orderData
      } = req.body;

      // Debug logging
      console.log("📤 Order API Request:", {
        url: "/api/orders",
        method: "POST",
        body: JSON.stringify(req.body, null, 2)
      });
      console.log("📤 Parsed body:", {
        client: clientData,
        products: productsData?.length || 0,
        userId,
        application,
        total,
        orderData
      });

      if (!clientData || !productsData || !userId) {
        return res
          .status(400)
          .json({ error: "Client, products, and userId are required" });
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
        // Create new client with proper defaults for optional fields
        client = await prisma.client.create({
          data: {
            client_number: clientData.client_number,
            name: clientData.name || "",
            address: clientData.address || "",
            application_used: application || "web",
          },
        });
      } else {
        // Update existing client if new information is provided
        const updateData = {};
        if (clientData.name && clientData.name.trim() !== "") {
          updateData.name = clientData.name;
        }
        if (clientData.address && clientData.address.trim() !== "") {
          updateData.address = clientData.address;
        }

        if (Object.keys(updateData).length > 0) {
          client = await prisma.client.update({
            where: { id: client.id },
            data: updateData,
          });
        }
      }

      // Ensure we have a default packaging to fall back to
      let defaultPackaging = await prisma.packaging.findFirst();
      if (!defaultPackaging) {
        defaultPackaging = await prisma.packaging.create({
          data: {
            type: "Standard",
            costPerUnit: 0.0,
            currentStock: 1000,
          },
        });
      }

      const order = await prisma.order.create({
        data: {
          application: application || "web",
          total: total || 0,
          status: orderData.status || "PENDING",
          promoCode: orderData.promoCode || null,
          notes: orderData.notes || null,
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
              packaging: { connect: { id: p.packagingId || defaultPackaging.id } },
              selectedVariants: p.selectedVariants ? {
                create: p.selectedVariants.map(v => ({
                  variantOption: { connect: { id: v.id } },
                  priceAtOrder: parseFloat(v.priceAdjustment || 0)
                }))
              } : undefined,
              selectedExtras: p.selectedExtras ? {
                create: p.selectedExtras.map(e => ({
                  extra: { connect: { id: e.id } },
                  priceAtOrder: parseFloat(e.price || 0)
                }))
              } : undefined
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
              selectedVariants: {
                include: {
                  variantOption: true
                }
              },
              selectedExtras: {
                include: {
                  extra: true
                }
              }
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
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    // Log the failing data
    console.error("Failing payload:", JSON.stringify(req.body, null, 2));
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
