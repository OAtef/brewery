const { PrismaClient } = require('@prisma/client');

async function createTestOrders() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Creating test orders for dashboard testing...\n');

    // Get users
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@coffeeshop.com' } });
    const cashierUser = await prisma.user.findUnique({ where: { email: 'cashier@coffeeshop.com' } });
    const users = [adminUser, cashierUser].filter(Boolean);

    if (users.length === 0) {
      console.log('❌ No users found. Please run the seed script first.');
      return;
    }

    // Get products, recipes, and packaging
    const products = await prisma.product.findMany({ take: 5 });
    const recipes = await prisma.recipe.findMany({
      take: 5,
      include: { product: true }
    });
    const packagingOptions = await prisma.packaging.findMany();

    console.log(`Found ${products.length} products, ${recipes.length} recipes, and ${packagingOptions.length} packaging options`);

    if (products.length === 0 || packagingOptions.length === 0) {
      console.log('❌ No products or packaging found. Please run the seed script first.');
      return;
    }

    // Create test clients
    const testClient1 = await prisma.client.upsert({
      where: { client_number: 'WALK-IN-001' },
      update: {},
      create: {
        client_number: 'WALK-IN-001',
        name: 'Walk-in Customer',
        address: '',
        application_used: 'POS'
      }
    });

    const testClient2 = await prisma.client.upsert({
      where: { client_number: 'ONLINE-001' },
      update: {},
      create: {
        client_number: 'ONLINE-001',
        name: 'Online Customer',
        address: '123 Coffee Street',
        application_used: 'Web'
      }
    });

    const clients = [testClient1, testClient2];
    console.log('✅ Test clients created/found\n');

    // Payment methods and priorities
    const paymentMethods = ['CASH', 'CARD', 'MOBILE_PAYMENT'];
    const paymentStatuses = ['PAID', 'PENDING'];
    const orderStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
    const priorities = ['URGENT', 'HIGH', 'NORMAL', 'LOW'];

    // Create test orders
    const today = new Date();
    const orders = [];

    console.log('Creating test orders...');
    for (let i = 0; i < 10; i++) {
      const orderTime = new Date(today);
      // Spread orders throughout the day (8 AM to 6 PM)
      orderTime.setHours(8 + Math.floor(i / 2), Math.floor(Math.random() * 60), 0, 0);

      // Randomly select order details
      const client = clients[Math.floor(Math.random() * clients.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      // Calculate pricing
      const subtotal = Math.random() * 40 + 10; // $10-50
      const tax = subtotal * 0.08; // 8% tax
      const discount = Math.random() > 0.7 ? Math.random() * 5 : 0; // Random discount sometimes
      const total = subtotal + tax - discount;

      // Payment details
      const paymentStatus = status === 'COMPLETED' ? 'PAID' : (Math.random() > 0.5 ? 'PAID' : 'PENDING');
      const amountPaid = paymentStatus === 'PAID' ? (paymentMethod === 'CASH' ? Math.ceil(total / 5) * 5 : total) : null;
      const changeGiven = paymentStatus === 'PAID' && paymentMethod === 'CASH' && amountPaid ? amountPaid - total : null;

      // Estimated completion time (5-20 minutes from creation)
      const estimatedCompletion = new Date(orderTime);
      estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + Math.floor(Math.random() * 15) + 5);

      // Completed time if order is completed
      const completedAt = status === 'COMPLETED' ? new Date(estimatedCompletion) : null;

      const order = await prisma.order.create({
        data: {
          clientId: client.id,
          userId: user.id,
          application: client.application_used,

          // Pricing
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          promoCode: discount > 0 ? 'WELCOME10' : null,

          // Payment
          paymentMethod: paymentMethod,
          paymentStatus: paymentStatus,
          amountPaid: amountPaid ? parseFloat(amountPaid.toFixed(2)) : null,
          changeGiven: changeGiven ? parseFloat(changeGiven.toFixed(2)) : null,
          receiptNumber: paymentStatus === 'PAID' ? `RCP-${Date.now()}-${i}` : null,

          // Order management
          status: status,
          priority: priority,
          estimatedCompletionTime: estimatedCompletion,
          completedAt: completedAt,
          notes: Math.random() > 0.7 ? 'Extra hot, no foam' : null,

          createdAt: orderTime,
        }
      });

      // Add products to the order
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const usedCombinations = new Set(); // Track used product+packaging combinations

      for (let j = 0; j < numItems; j++) {
        let productId, recipeId, packagingId, unitPrice, quantity;
        let attempts = 0;
        const maxAttempts = 10;

        // Try to find a unique combination
        do {
          const packaging = packagingOptions[Math.floor(Math.random() * Math.min(3, packagingOptions.length))]; // Prefer cups

          if (recipes.length > 0 && Math.random() > 0.3) {
            // Add a recipe item (70% chance)
            const recipe = recipes[Math.floor(Math.random() * recipes.length)];
            productId = recipe.productId;
            recipeId = recipe.id;
            packagingId = packaging.id;
            quantity = Math.floor(Math.random() * 2) + 1;
            const basePrice = 3.50 + recipe.priceModifier;
            unitPrice = parseFloat(basePrice.toFixed(2));
          } else if (products.length > 0) {
            // Add a product item (30% chance or fallback)
            const product = products[Math.floor(Math.random() * products.length)];
            productId = product.id;
            recipeId = null;
            packagingId = packaging.id;
            quantity = Math.floor(Math.random() * 2) + 1;
            unitPrice = product.basePrice > 0 ? product.basePrice : parseFloat((Math.random() * 10 + 5).toFixed(2));
          }

          attempts++;
        } while (usedCombinations.has(`${productId}-${packagingId}`) && attempts < maxAttempts);

        // Skip if we couldn't find a unique combination after max attempts
        if (usedCombinations.has(`${productId}-${packagingId}`)) {
          continue;
        }

        usedCombinations.add(`${productId}-${packagingId}`);

        await prisma.orderProduct.create({
          data: {
            orderId: order.id,
            productId: productId,
            recipeId: recipeId,
            packagingId: packagingId,
            quantity: quantity,
            unitPrice: unitPrice,
          }
        });
      }

      orders.push(order);
      console.log(`  ✓ Order ${i + 1}: ${status} - ${priority} priority - $${total.toFixed(2)}`);
    }

    console.log(`\n✅ Created ${orders.length} test orders for today`);

    // Print summary
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const paidOrders = orders.filter(o => o.paymentStatus === 'PAID').length;
    console.log(`\n📊 Summary:`);
    console.log(`   Total revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`   Total orders: ${orders.length}`);
    console.log(`   Paid orders: ${paidOrders}`);
    console.log(`   Pending orders: ${orders.filter(o => o.status === 'PENDING').length}`);
    console.log(`   Completed orders: ${orders.filter(o => o.status === 'COMPLETED').length}`);

    return orders;
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();
