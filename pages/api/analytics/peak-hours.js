import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { period = 'today', timezone = 'UTC' } = req.query;
      
      // Calculate date range based on period
      const now = new Date();
      let startDate, endDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
      }

      // Fetch orders within the date range
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          products: {
            include: {
              product: true,
              recipe: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Initialize hourly data structure (0-23 hours)
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        hourLabel: `${hour.toString().padStart(2, '0')}:00`,
        orderCount: 0,
        revenue: 0,
        averageOrderValue: 0,
        topItems: {},
        busyLevel: 'low', // low, medium, high, peak
      }));

      // Process orders into hourly buckets
      orders.forEach(order => {
        const orderHour = new Date(order.createdAt).getHours();
        const hourData = hourlyData[orderHour];
        
        hourData.orderCount += 1;
        hourData.revenue += order.total || 0;
        
        // Track top items for this hour
        order.products?.forEach(item => {
          const itemName = item.product?.name || item.recipe?.product?.name || 'Unknown';
          hourData.topItems[itemName] = (hourData.topItems[itemName] || 0) + item.quantity;
        });
      });

      // Calculate average order values and determine busy levels
      const maxOrderCount = Math.max(...hourlyData.map(h => h.orderCount));
      
      hourlyData.forEach(hourData => {
        if (hourData.orderCount > 0) {
          hourData.averageOrderValue = hourData.revenue / hourData.orderCount;
        }
        
        // Convert topItems object to sorted array
        hourData.topItems = Object.entries(hourData.topItems)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));
        
        // Determine busy level
        const intensity = maxOrderCount > 0 ? hourData.orderCount / maxOrderCount : 0;
        if (intensity >= 0.8) {
          hourData.busyLevel = 'peak';
        } else if (intensity >= 0.6) {
          hourData.busyLevel = 'high';
        } else if (intensity >= 0.3) {
          hourData.busyLevel = 'medium';
        } else {
          hourData.busyLevel = 'low';
        }
      });

      // Calculate insights
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Find peak hours
      const peakHours = hourlyData
        .filter(h => h.orderCount > 0)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 3);
      
      // Find quiet hours
      const quietHours = hourlyData
        .filter(h => h.orderCount === 0)
        .map(h => h.hour);
      
      // Calculate rush periods (consecutive busy hours)
      const rushPeriods = [];
      let currentRush = null;
      
      hourlyData.forEach((hourData, index) => {
        if (hourData.busyLevel === 'high' || hourData.busyLevel === 'peak') {
          if (!currentRush) {
            currentRush = {
              start: hourData.hour,
              end: hourData.hour,
              orders: hourData.orderCount,
              revenue: hourData.revenue,
            };
          } else {
            currentRush.end = hourData.hour;
            currentRush.orders += hourData.orderCount;
            currentRush.revenue += hourData.revenue;
          }
        } else {
          if (currentRush && currentRush.end - currentRush.start >= 0) {
            rushPeriods.push(currentRush);
            currentRush = null;
          }
        }
      });
      
      // Don't forget the last rush period
      if (currentRush) {
        rushPeriods.push(currentRush);
      }

      const insights = {
        totalOrders,
        totalRevenue,
        peakHours: peakHours.map(h => ({
          hour: h.hour,
          hourLabel: h.hourLabel,
          orderCount: h.orderCount,
          revenue: h.revenue,
        })),
        quietHours,
        rushPeriods: rushPeriods.map(period => ({
          ...period,
          startLabel: `${period.start.toString().padStart(2, '0')}:00`,
          endLabel: `${period.end.toString().padStart(2, '0')}:00`,
          duration: period.end - period.start + 1,
        })),
        averageOrdersPerHour: totalOrders / 24,
        busiestHour: peakHours[0] || null,
        mostRevenueHour: hourlyData.reduce((max, hour) => 
          hour.revenue > max.revenue ? hour : max, hourlyData[0]
        ),
      };

      res.status(200).json({
        hourlyData,
        insights,
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Peak hours API error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}
