const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickSeedPOS() {
  try {
    console.log('🌱 Quick seeding for POS testing...\n');

    // Create a category first
    const category = await prisma.category.upsert({
      where: { name: 'Coffee' },
      update: {},
      create: { name: 'Coffee' }
    });
    console.log('✅ Category created/found:', category.name);

    // Create packaging
    const packaging = await prisma.packaging.upsert({
      where: { type: 'Paper Cup' },
      update: {},
      create: {
        type: 'Paper Cup',
        costPerUnit: 0.25,
        currentStock: 1000
      }
    });
    console.log('✅ Packaging created/found:', packaging.type);

    // Create a product with variants
    const latte = await prisma.product.create({
      data: {
        name: 'Latte',
        basePrice: 4.50,
        description: 'Classic espresso with steamed milk',
        categoryId: category.id,
        categoryName: category.name,
        isActive: true,
        variantGroups: {
          create: [
            {
              name: 'Size',
              options: {
                create: [
                  { name: 'Small', priceAdjustment: -0.50 },
                  { name: 'Medium', priceAdjustment: 0.00 },
                  { name: 'Large', priceAdjustment: 1.00 },
                ]
              }
            },
            {
              name: 'Milk Type',
              options: {
                create: [
                  { name: 'Whole Milk', priceAdjustment: 0.00 },
                  { name: 'Oat Milk', priceAdjustment: 0.50 },
                  { name: 'Almond Milk', priceAdjustment: 0.50 },
                  { name: 'Soy Milk', priceAdjustment: 0.50 },
                ]
              }
            },
            {
              name: 'Temperature',
              options: {
                create: [
                  { name: 'Hot', priceAdjustment: 0.00 },
                  { name: 'Iced', priceAdjustment: 0.00 },
                  { name: 'Extra Hot', priceAdjustment: 0.25 },
                ]
              }
            }
          ]
        }
      },
      include: {
        variantGroups: {
          include: { options: true }
        }
      }
    });
    console.log('✅ Product created:', latte.name);
    console.log(`   - ${latte.variantGroups.length} variant groups with options`);

    // Create another product
    const cappuccino = await prisma.product.create({
      data: {
        name: 'Cappuccino',
        basePrice: 4.00,
        description: 'Espresso with steamed milk and foam',
        categoryId: category.id,
        categoryName: category.name,
        isActive: true,
        variantGroups: {
          create: [
            {
              name: 'Size',
              options: {
                create: [
                  { name: 'Small', priceAdjustment: -0.50 },
                  { name: 'Medium', priceAdjustment: 0.00 },
                  { name: 'Large', priceAdjustment: 1.00 },
                ]
              }
            }
          ]
        }
      }
    });
    console.log('✅ Product created:', cappuccino.name);

    // Create extras
    const extras = await Promise.all([
      prisma.extra.create({ data: { name: 'Extra Shot', price: 1.00 } }),
      prisma.extra.create({ data: { name: 'Caramel Syrup', price: 0.75 } }),
      prisma.extra.create({ data: { name: 'Vanilla Syrup', price: 0.75 } }),
      prisma.extra.create({ data: { name: 'Hazelnut Syrup', price: 0.75 } }),
      prisma.extra.create({ data: { name: 'Whipped Cream', price: 0.50 } }),
      prisma.extra.create({ data: { name: 'Chocolate Sauce', price: 0.75 } }),
    ]);
    console.log(`✅ Created ${extras.length} extras`);

    console.log('\n✅ POS test data seeded successfully!');
    console.log('\nYou can now:');
    console.log('- Visit http://localhost:3001');
    console.log('- Go to "New Order" tab');
    console.log('- Select a product and customize with variants and extras');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

quickSeedPOS();
