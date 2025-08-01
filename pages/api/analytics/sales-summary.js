import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's orders
      const todaysOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          products: {
            include: {
              product: true,
              recipe: true,
            },
          },
        },
      });

      // Calculate metrics
      const totalOrders = todaysOrders.length;
      const totalRevenue = todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get most popular items today
      const productCounts = {};
      todaysOrders.forEach(order => {
        order.products.forEach(orderProduct => {
          const productName = orderProduct.product?.name || orderProduct.recipe?.product?.name || 'Unknown';
          productCounts[productName] = (productCounts[productName] || 0) + orderProduct.quantity;
        });
      });

      const popularItems = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Compare with yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = new Date(yesterday);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const yesterdaysOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      });

      const yesterdayRevenue = yesterdaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const revenueChange = yesterdayRevenue > 0 ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

      res.status(200).json({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        popularItems,
        revenueChange,
        yesterdayRevenue,
        date: today.toISOString().split('T')[0],
      });
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Sales summary API error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}
