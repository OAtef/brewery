const { PrismaClient } = require('./prisma/generated/prisma');

async function seedDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Checking database state and seeding if needed...\n');

    // Always ensure admin user exists
    console.log('1. Ensuring admin user exists...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@coffeeshop.com' },
      update: {
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        name: 'Admin User',
        email: 'admin@coffeeshop.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin user ready: ${adminUser.email} (password: admin123)`);

    // Check if database already has sample data
    const existingIngredients = await prisma.ingredient.count();
    if (existingIngredients > 0) {
      console.log(`\n📦 Database already contains ${existingIngredients} ingredients. Skipping sample data creation.`);
      console.log('\n✅ Database check complete!');
      console.log('\nYou can now:');
      console.log('- Login with admin@coffeeshop.com / admin123');
      console.log('- Access Recipe Management at /recipes');
      console.log('- View and manage products and recipes');
      return;
    }

    console.log('\n📝 Database is empty. Creating sample data...');

    // Create ingredients first
    console.log('2. Creating ingredients...');
    const ingredients = await Promise.all([
      prisma.ingredient.create({
        data: {
          name: 'Espresso Shot',
          unit: 'ml',
          costPerUnit: 0.15,
          currentStock: 1000.0,
          wastePercentage: 0.05,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Milk',
          unit: 'ml',
          costPerUnit: 0.002,
          currentStock: 5000.0,
          wastePercentage: 0.02,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Milk Foam',
          unit: 'ml',
          costPerUnit: 0.001,
          currentStock: 2000.0,
          wastePercentage: 0.10,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Hot Water',
          unit: 'ml',
          costPerUnit: 0.001,
          currentStock: 10000.0,
          wastePercentage: 0.01,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Sugar',
          unit: 'g',
          costPerUnit: 0.01,
          currentStock: 500.0,
          wastePercentage: 0.05,
        },
      }),
    ]);
    console.log(`✅ Created ${ingredients.length} ingredients`);

    // Create products
    console.log('\n3. Creating products...');
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Cappuccino',
          category: 'Espresso',
          basePrice: 4.50,
          description: 'Rich espresso with steamed milk and foam',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Latte',
          category: 'Espresso',
          basePrice: 4.75,
          description: 'Smooth espresso with steamed milk',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Americano',
          category: 'Coffee',
          basePrice: 3.50,
          description: 'Rich espresso with hot water',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Espresso',
          category: 'Espresso',
          basePrice: 2.50,
          description: 'Pure, concentrated coffee shot',
        },
      }),
      // Retail products
      prisma.product.create({
        data: {
          name: 'Ethiopian Coffee Beans',
          category: 'Beans',
          basePrice: 15.99,
          description: 'Premium Ethiopian single-origin beans',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Colombian Coffee Beans',
          category: 'Beans',
          basePrice: 14.99,
          description: 'Smooth Colombian coffee beans',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Coffee Grinder',
          category: 'Equipment',
          basePrice: 89.99,
          description: 'Professional burr coffee grinder',
        },
      }),
      prisma.product.create({
        data: {
          name: 'French Press',
          category: 'Equipment',
          basePrice: 29.99,
          description: 'Classic French press coffee maker',
        },
      }),
    ]);
    console.log(`✅ Created ${products.length} products (${products.filter(p => ['Espresso', 'Coffee'].includes(p.category)).length} drinks + ${products.filter(p => !['Espresso', 'Coffee'].includes(p.category)).length} retail products)`);

    // Create recipe variants for drink products
    console.log('\n5. Creating recipe variants for drinks...');
    
    // Find the drink products
    const cappuccino = products.find(p => p.name === 'Cappuccino');
    const latte = products.find(p => p.name === 'Latte');
    const americano = products.find(p => p.name === 'Americano');
    const espresso = products.find(p => p.name === 'Espresso');

    const recipes = await Promise.all([
      // Cappuccino variants
      prisma.recipe.create({
        data: {
          productId: cappuccino.id,
          variant: 'Regular',
          priceModifier: 0.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: cappuccino.id,
          variant: 'Decaf',
          priceModifier: 0.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: cappuccino.id,
          variant: 'Extra Shot',
          priceModifier: 0.75,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: cappuccino.id,
          variant: 'Oat Milk',
          priceModifier: 0.50,
          isActive: true,
        },
      }),

      // Latte variants
      prisma.recipe.create({
        data: {
          productId: latte.id,
          variant: 'Regular',
          priceModifier: 0.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: latte.id,
          variant: 'Vanilla',
          priceModifier: 0.60,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: latte.id,
          variant: 'Caramel',
          priceModifier: 0.60,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: latte.id,
          variant: 'Almond Milk',
          priceModifier: 0.50,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: latte.id,
          variant: 'Iced',
          priceModifier: 0.00,
          isActive: true,
        },
      }),

      // Americano variants
      prisma.recipe.create({
        data: {
          productId: americano.id,
          variant: 'Regular',
          priceModifier: 0.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: americano.id,
          variant: 'Iced',
          priceModifier: 0.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: americano.id,
          variant: 'Extra Strong',
          priceModifier: 0.50,
          isActive: true,
        },
      }),

      // Espresso variants
      prisma.recipe.create({
        data: {
          productId: espresso.id,
          variant: 'Single Shot',
          priceModifier: 0.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: espresso.id,
          variant: 'Double Shot',
          priceModifier: 1.00,
          isActive: true,
        },
      }),
      prisma.recipe.create({
        data: {
          productId: espresso.id,
          variant: 'Lungo',
          priceModifier: 0.25,
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${recipes.length} recipe variants for drinks`);

    // Create packaging options
    console.log('\n6. Creating packaging options...');
    const packaging = await Promise.all([
      prisma.packaging.upsert({
        where: { type: 'Small Cup (8oz)' },
        update: {},
        create: {
          type: 'Small Cup (8oz)',
          costPerUnit: 0.15,
          currentStock: 500,
        },
      }),
      prisma.packaging.upsert({
        where: { type: 'Medium Cup (12oz)' },
        update: {},
        create: {
          type: 'Medium Cup (12oz)',
          costPerUnit: 0.20,
          currentStock: 500,
        },
      }),
      prisma.packaging.upsert({
        where: { type: 'Large Cup (16oz)' },
        update: {},
        create: {
          type: 'Large Cup (16oz)',
          costPerUnit: 0.25,
          currentStock: 500,
        },
      }),
      prisma.packaging.upsert({
        where: { type: 'Takeaway Bag' },
        update: {},
        create: {
          type: 'Takeaway Bag',
          costPerUnit: 0.10,
          currentStock: 200,
        },
      }),
      prisma.packaging.upsert({
        where: { type: 'Gift Box' },
        update: {},
        create: {
          type: 'Gift Box',
          costPerUnit: 2.50,
          currentStock: 50,
        },
      }),
    ]);
    console.log(`✅ Created ${packaging.length} packaging options`);

    // Create recipes with ingredients
    console.log('\n5. Creating recipes...');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now:');
    console.log('- Login with admin@coffeeshop.com / admin123');
    console.log('- Create orders with product variants at /orders/new');
    console.log('- Manage orders at /orders');
    console.log('- View inventory at /inventory');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
