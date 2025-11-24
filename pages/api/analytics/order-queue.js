import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Get all orders with status filtering
      const { status } = req.query;
      
      const whereCondition = {};
      if (status && status !== 'all') {
        whereCondition.status = status.toUpperCase();
      }

      const orders = await prisma.order.findMany({
        where: whereCondition,
        include: {
          client: true,
          user: true,
          products: {
            include: {
              product: true,
              recipe: {
                include: {
                  product: true
                }
              },
              packaging: true,
              selectedVariants: {
                include: {
                  variantOption: {
                    include: {
                      variantGroup: true
                    }
                  }
                }
              },
              selectedExtras: {
                include: {
                  extra: true
                }
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Limit to last 50 orders for performance
      });

      // Calculate time-based metrics for each order
      const enrichedOrders = orders.map(order => {
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const timeSinceOrder = Math.floor((now - createdAt) / (1000 * 60)); // minutes
        
        // Estimate processing time based on number of items
        const totalItems = order.products.reduce((sum, p) => sum + p.quantity, 0);
        const estimatedProcessingTime = Math.max(5, totalItems * 3); // 3 min per item, min 5 min
        
        // Determine priority based on wait time
        let priority = 'normal';
        if (timeSinceOrder > estimatedProcessingTime + 10) {
          priority = 'urgent';
        } else if (timeSinceOrder > estimatedProcessingTime) {
          priority = 'high';
        }

        return {
          ...order,
          timeSinceOrder,
          estimatedProcessingTime,
          priority,
          isOverdue: timeSinceOrder > estimatedProcessingTime + 5,
        };
      });

      // Group orders by status for easier processing
      const ordersByStatus = {
        pending: enrichedOrders.filter(o => o.status === 'PENDING'),
        preparing: enrichedOrders.filter(o => o.status === 'PREPARING'),
        ready: enrichedOrders.filter(o => o.status === 'READY'),
        completed: enrichedOrders.filter(o => o.status === 'COMPLETED'),
        cancelled: enrichedOrders.filter(o => o.status === 'CANCELLED'),
      };

      // Calculate queue statistics
      const queueStats = {
        totalActive: ordersByStatus.pending.length + ordersByStatus.preparing.length + ordersByStatus.ready.length,
        totalPending: ordersByStatus.pending.length,
        totalPreparing: ordersByStatus.preparing.length,
        totalReady: ordersByStatus.ready.length,
        averageWaitTime: enrichedOrders.length > 0 
          ? Math.round(enrichedOrders.reduce((sum, o) => sum + o.timeSinceOrder, 0) / enrichedOrders.length)
          : 0,
        overdueOrders: enrichedOrders.filter(o => o.isOverdue).length,
        urgentOrders: enrichedOrders.filter(o => o.priority === 'urgent').length,
      };

      res.status(200).json({
        orders: enrichedOrders,
        ordersByStatus,
        queueStats,
        timestamp: new Date().toISOString(),
      });
    } else if (req.method === "PATCH") {
      // Update order status
      const { orderId, status, notes } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: "Order ID and status are required" });
      }

      const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({ 
          error: "Invalid status", 
          validStatuses 
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status: status.toUpperCase(),
          notes: notes || null,
          updatedAt: new Date(),
        },
        include: {
          client: true,
          products: {
            include: {
              product: true,
              recipe: {
                include: {
                  product: true
                }
              },
              packaging: true,
              selectedVariants: {
                include: {
                  variantOption: {
                    include: {
                      variantGroup: true
                    }
                  }
                }
              },
              selectedExtras: {
                include: {
                  extra: true
                }
              },
            },
          },
        },
      });

      res.status(200).json(updatedOrder);
    } else {
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Order queue API error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}
