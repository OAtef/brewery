const { PrismaClient } = require('@prisma/client');

async function seedDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Checking database state and seeding if needed...\n');

    // Always ensure users exist
    console.log('1. Ensuring users exist...');
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

    // Create cashier user
    const cashierUser = await prisma.user.upsert({
      where: { email: 'cashier@coffeeshop.com' },
      update: {
        name: 'Cashier User',
        password: hashedPassword,
        role: 'CASHIER',
      },
      create: {
        name: 'Cashier User',
        email: 'cashier@coffeeshop.com',
        password: hashedPassword,
        role: 'CASHIER',
      },
    });
    console.log(`✅ Cashier user ready: ${cashierUser.email} (password: admin123)`);

    // Create barista user
    const baristaUser = await prisma.user.upsert({
      where: { email: 'barista@coffeeshop.com' },
      update: {
        name: 'Barista User',
        password: hashedPassword,
        role: 'BARISTA',
      },
      create: {
        name: 'Barista User',
        email: 'barista@coffeeshop.com',
        password: hashedPassword,
        role: 'BARISTA',
      },
    });
    console.log(`✅ Barista user ready: ${baristaUser.email} (password: admin123)`);

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
      // Coffee Base Ingredients
      prisma.ingredient.create({
        data: {
          name: 'Coffee Beans (Espresso)',
          unit: 'g',
          costPerUnit: 0.045, // ~$45/kg premium coffee beans
          currentStock: 5000.0,
          wastePercentage: 0.03,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Water',
          unit: 'ml',
          costPerUnit: 0.0005, // Very low cost for filtered water
          currentStock: 50000.0,
          wastePercentage: 0.01,
        },
      }),
      
      // Milk Products
      prisma.ingredient.create({
        data: {
          name: 'Whole Milk',
          unit: 'ml',
          costPerUnit: 0.0015, // ~$1.50/liter
          currentStock: 10000.0,
          wastePercentage: 0.02,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Oat Milk',
          unit: 'ml',
          costPerUnit: 0.004, // Premium alt milk ~$4/liter
          currentStock: 2000.0,
          wastePercentage: 0.03,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Almond Milk',
          unit: 'ml',
          costPerUnit: 0.0035, // ~$3.50/liter
          currentStock: 2000.0,
          wastePercentage: 0.03,
        },
      }),
      
      // Syrups and Flavorings
      prisma.ingredient.create({
        data: {
          name: 'Vanilla Syrup',
          unit: 'ml',
          costPerUnit: 0.08, // ~$80/liter for quality syrup
          currentStock: 500.0,
          wastePercentage: 0.01,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Caramel Syrup',
          unit: 'ml',
          costPerUnit: 0.08,
          currentStock: 500.0,
          wastePercentage: 0.01,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Chocolate Powder',
          unit: 'g',
          costPerUnit: 0.02, // ~$20/kg
          currentStock: 1000.0,
          wastePercentage: 0.02,
        },
      }),
      
      // Additional ingredients
      prisma.ingredient.create({
        data: {
          name: 'Sugar',
          unit: 'g',
          costPerUnit: 0.002, // ~$2/kg
          currentStock: 2000.0,
          wastePercentage: 0.05,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Cinnamon Powder',
          unit: 'g',
          costPerUnit: 0.15, // ~$150/kg for quality spice
          currentStock: 100.0,
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
          basePrice: 0.0, // Will be calculated from ingredients
          description: 'Rich espresso with steamed milk and thick foam',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Latte',
          category: 'Espresso',
          basePrice: 0.0, // Will be calculated from ingredients
          description: 'Smooth espresso with steamed milk and light foam',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Americano',
          category: 'Coffee',
          basePrice: 0.0, // Will be calculated from ingredients
          description: 'Rich espresso with hot water',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Espresso',
          category: 'Espresso',
          basePrice: 0.0, // Will be calculated from ingredients
          description: 'Pure, concentrated coffee shot',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Mocha',
          category: 'Espresso',
          basePrice: 0.0, // Will be calculated from ingredients
          description: 'Espresso with chocolate, steamed milk and foam',
        },
      }),
      prisma.product.create({
        data: {
          name: 'Flat White',
          category: 'Espresso',
          basePrice: 0.0, // Will be calculated from ingredients
          description: 'Double espresso with microfoam steamed milk',
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
    console.log('\n5. Creating recipe variants with ingredients...');
    
    // Find ingredients for easy reference
    const coffeeBeans = ingredients.find(i => i.name === 'Coffee Beans (Espresso)');
    const water = ingredients.find(i => i.name === 'Water');
    const wholeMilk = ingredients.find(i => i.name === 'Whole Milk');
    const oatMilk = ingredients.find(i => i.name === 'Oat Milk');
    const almondMilk = ingredients.find(i => i.name === 'Almond Milk');
    const vanillaSyrup = ingredients.find(i => i.name === 'Vanilla Syrup');
    const caramelSyrup = ingredients.find(i => i.name === 'Caramel Syrup');
    const chocolatePowder = ingredients.find(i => i.name === 'Chocolate Powder');
    const sugar = ingredients.find(i => i.name === 'Sugar');
    const cinnamon = ingredients.find(i => i.name === 'Cinnamon Powder');

    // Find drink products
    const cappuccino = products.find(p => p.name === 'Cappuccino');
    const latte = products.find(p => p.name === 'Latte');
    const americano = products.find(p => p.name === 'Americano');
    const espresso = products.find(p => p.name === 'Espresso');
    const mocha = products.find(p => p.name === 'Mocha');
    const flatWhite = products.find(p => p.name === 'Flat White');

    const recipes = [];

    // CAPPUCCINO RECIPES (1:1:1 ratio - espresso:steamed milk:foam)
    recipes.push(await prisma.recipe.create({
      data: {
        productId: cappuccino.id,
        variant: 'Regular',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 }, // 18g beans for double shot
            { ingredientId: water.id, quantity: 60.0 }, // 60ml for double espresso
            { ingredientId: wholeMilk.id, quantity: 150.0 }, // 150ml milk (100ml steamed + 50ml foam)
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: cappuccino.id,
        variant: 'Decaf',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 }, // Same amount, decaf beans
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 150.0 },
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: cappuccino.id,
        variant: 'Extra Shot',
        priceModifier: 0.50, // Premium for extra coffee
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 27.0 }, // Triple shot
            { ingredientId: water.id, quantity: 90.0 },
            { ingredientId: wholeMilk.id, quantity: 150.0 },
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: cappuccino.id,
        variant: 'Oat Milk',
        priceModifier: 0.60, // Premium for alt milk
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: oatMilk.id, quantity: 150.0 },
          ],
        },
      },
    }));

    // LATTE RECIPES (1:3 ratio - espresso:steamed milk with minimal foam)
    recipes.push(await prisma.recipe.create({
      data: {
        productId: latte.id,
        variant: 'Regular',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 180.0 }, // More milk, less foam
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: latte.id,
        variant: 'Vanilla',
        priceModifier: 0.75,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 180.0 },
            { ingredientId: vanillaSyrup.id, quantity: 15.0 }, // 15ml syrup
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: latte.id,
        variant: 'Caramel',
        priceModifier: 0.75,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 180.0 },
            { ingredientId: caramelSyrup.id, quantity: 15.0 },
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: latte.id,
        variant: 'Almond Milk',
        priceModifier: 0.60,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: almondMilk.id, quantity: 180.0 },
          ],
        },
      },
    }));

    // AMERICANO RECIPES (1:2 ratio - espresso:hot water)
    recipes.push(await prisma.recipe.create({
      data: {
        productId: americano.id,
        variant: 'Regular',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 180.0 }, // 60ml espresso + 120ml hot water
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: americano.id,
        variant: 'Long Shot',
        priceModifier: 0.25,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 240.0 }, // More water for milder taste
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: americano.id,
        variant: 'Extra Strong',
        priceModifier: 0.50,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 27.0 }, // Triple shot
            { ingredientId: water.id, quantity: 150.0 },
          ],
        },
      },
    }));

    // ESPRESSO RECIPES
    recipes.push(await prisma.recipe.create({
      data: {
        productId: espresso.id,
        variant: 'Single Shot',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 9.0 }, // 9g for single shot
            { ingredientId: water.id, quantity: 30.0 }, // 30ml output
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: espresso.id,
        variant: 'Double Shot',
        priceModifier: 0.75,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: espresso.id,
        variant: 'Lungo',
        priceModifier: 0.25,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 90.0 }, // Longer extraction
          ],
        },
      },
    }));

    // MOCHA RECIPES
    recipes.push(await prisma.recipe.create({
      data: {
        productId: mocha.id,
        variant: 'Regular',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 150.0 },
            { ingredientId: chocolatePowder.id, quantity: 15.0 }, // 15g chocolate
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: mocha.id,
        variant: 'Dark Chocolate',
        priceModifier: 0.50,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 150.0 },
            { ingredientId: chocolatePowder.id, quantity: 20.0 }, // More chocolate
          ],
        },
      },
    }));

    // FLAT WHITE RECIPES
    recipes.push(await prisma.recipe.create({
      data: {
        productId: flatWhite.id,
        variant: 'Regular',
        priceModifier: 0.00,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 }, // Double shot
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: wholeMilk.id, quantity: 120.0 }, // Less milk than latte, microfoam
          ],
        },
      },
    }));

    recipes.push(await prisma.recipe.create({
      data: {
        productId: flatWhite.id,
        variant: 'Oat Milk',
        priceModifier: 0.60,
        isActive: true,
        ingredients: {
          create: [
            { ingredientId: coffeeBeans.id, quantity: 18.0 },
            { ingredientId: water.id, quantity: 60.0 },
            { ingredientId: oatMilk.id, quantity: 120.0 },
          ],
        },
      },
    }));

    console.log(`✅ Created ${recipes.length} recipe variants with realistic ingredients`);

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
