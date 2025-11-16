const prisma = require('../../lib/prisma').default;

async function createTestOrders() {
  try {
    console.log('🧪 Creating test orders for dashboard testing...');

    // Get some products and recipes to use
    const products = await prisma.product.findMany({ take: 3 });
    const recipes = await prisma.recipe.findMany({ 
      take: 3,
      include: { product: true }
    });

    console.log(`Found ${products.length} products and ${recipes.length} recipes`);

    if (products.length === 0 && recipes.length === 0) {
      console.log('❌ No products or recipes found. Please run the seed script first.');
      return;
    }

    // Create a test client
    const testClient = await prisma.client.upsert({
      where: { email: 'test.customer@coffeeshop.com' },
      update: {},
      create: {
        name: 'Test Customer',
        email: 'test.customer@coffeeshop.com',
        address: '123 Coffee Street',
        phone: '555-0123'
      }
    });

    console.log('✅ Test client created/found');

    // Create some test orders for today
    const today = new Date();
    const orders = [];

    for (let i = 0; i < 5; i++) {
      const orderTime = new Date(today);
      orderTime.setHours(8 + i * 2, Math.random() * 60, 0, 0); // Spread throughout the day
      
      const total = Math.random() * 50 + 10; // Random total between $10-60

      const order = await prisma.order.create({
        data: {
          clientId: testClient.id,
          status: Math.random() > 0.5 ? 'completed' : 'pending',
          total: total,
          createdAt: orderTime,
        }
      });

      // Add some products to the order
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      for (let j = 0; j < numItems; j++) {
        if (recipes.length > 0 && Math.random() > 0.5) {
          // Add a recipe item
          const recipe = recipes[Math.floor(Math.random() * recipes.length)];
          await prisma.orderProduct.create({
            data: {
              orderId: order.id,
              recipeId: recipe.id,
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.random() * 8 + 3 // $3-11
            }
          });
        } else if (products.length > 0) {
          // Add a product item
          const product = products[Math.floor(Math.random() * products.length)];
          await prisma.orderProduct.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: Math.floor(Math.random() * 2) + 1,
              price: product.price || Math.random() * 15 + 5 // Use product price or random $5-20
            }
          });
        }
      }

      orders.push(order);
    }

    console.log(`✅ Created ${orders.length} test orders for today`);
    
    // Print summary
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    console.log(`📊 Total test revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`📦 Total test orders: ${orders.length}`);
    
    return orders;
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();
