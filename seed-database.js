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
    console.log('\n2. Creating products...');
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Cappuccino',
          category: 'Espresso',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Latte',
          category: 'Espresso',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Americano',
          category: 'Coffee',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Espresso',
          category: 'Espresso',
        },
      }),
      // Retail products
      prisma.product.create({
        data: {
          name: 'Ethiopian Coffee Beans',
          category: 'Beans',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Colombian Coffee Beans',
          category: 'Beans',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Coffee Grinder',
          category: 'Equipment',
        },
      }),
      prisma.product.create({
        data: {
          name: 'French Press',
          category: 'Equipment',
        },
      }),
    ]);
    console.log(`✅ Created ${products.length} products (${products.filter(p => ['Espresso', 'Coffee'].includes(p.category)).length} drinks + ${products.filter(p => !['Espresso', 'Coffee'].includes(p.category)).length} retail products)`);

    // Create recipes with ingredients
    console.log('\n3. Creating recipes...');
    
    // Cappuccino Regular
    const cappuccinoRecipe = await prisma.recipe.create({
      data: {
        productId: products[0].id, // Cappuccino
        variant: 'Regular',
        ingredients: {
          create: [
            {
              ingredientId: ingredients[0].id, // Espresso Shot
              quantity: 30.0,
            },
            {
              ingredientId: ingredients[1].id, // Milk
              quantity: 120.0,
            },
            {
              ingredientId: ingredients[2].id, // Milk Foam
              quantity: 60.0,
            },
          ],
        },
      },
    });

    // Latte Regular
    const latteRecipe = await prisma.recipe.create({
      data: {
        productId: products[1].id, // Latte
        variant: 'Regular',
        ingredients: {
          create: [
            {
              ingredientId: ingredients[0].id, // Espresso Shot
              quantity: 30.0,
            },
            {
              ingredientId: ingredients[1].id, // Milk
              quantity: 180.0,
            },
            {
              ingredientId: ingredients[2].id, // Milk Foam
              quantity: 30.0,
            },
          ],
        },
      },
    });

    // Americano Regular
    const americanoRecipe = await prisma.recipe.create({
      data: {
        productId: products[2].id, // Americano
        variant: 'Regular',
        ingredients: {
          create: [
            {
              ingredientId: ingredients[0].id, // Espresso Shot
              quantity: 60.0,
            },
            {
              ingredientId: ingredients[3].id, // Hot Water
              quantity: 120.0,
            },
          ],
        },
      },
    });

    // Espresso Double Shot
    const espressoRecipe = await prisma.recipe.create({
      data: {
        productId: products[3].id, // Espresso
        variant: 'Double Shot',
        ingredients: {
          create: [
            {
              ingredientId: ingredients[0].id, // Espresso Shot
              quantity: 60.0,
            },
          ],
        },
      },
    });

    console.log(`✅ Created 4 recipes with ingredients`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now:');
    console.log('- Login with admin@coffeeshop.com / admin123');
    console.log('- Access Recipe Management at /recipes');
    console.log('- View and manage products and recipes');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
