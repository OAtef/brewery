const { PrismaClient } = require('@prisma/client');

async function seedVariantsAndExtras() {
  const prisma = new PrismaClient();

  try {
    console.log('🌱 Seeding variant groups and extras for POS system...\n');

    // Find a product to add variants to (e.g., Latte)
    const latte = await prisma.product.findFirst({
      where: { name: { contains: 'Latte', mode: 'insensitive' } },
      include: { variantGroups: true }
    });

    if (!latte) {
      console.log('⚠️ No Latte product found. Please run seed-database.js first.');
      return;
    }

    console.log(`Found product: ${latte.name} (ID: ${latte.id})`);

    // Only add variant groups if they don't exist
    if (latte.variantGroups.length === 0) {
      console.log('\n1. Creating variant groups for Latte...');

      // Create Size variant group
      const sizeGroup = await prisma.variantGroup.create({
        data: {
          name: 'Size',
          productId: latte.id,
          options: {
            create: [
              { name: 'Small', priceAdjustment: -0.50 },
              { name: 'Medium', priceAdjustment: 0.00 },
              { name: 'Large', priceAdjustment: 1.00 },
            ]
          }
        },
        include: { options: true }
      });
      console.log(`✅ Created Size group with ${sizeGroup.options.length} options`);

      // Create Milk Type variant group
      const milkGroup = await prisma.variantGroup.create({
        data: {
          name: 'Milk Type',
          productId: latte.id,
          options: {
            create: [
              { name: 'Whole Milk', priceAdjustment: 0.00 },
              { name: 'Oat Milk', priceAdjustment: 0.50 },
              { name: 'Almond Milk', priceAdjustment: 0.50 },
              { name: 'Soy Milk', priceAdjustment: 0.50 },
            ]
          }
        },
        include: { options: true }
      });
      console.log(`✅ Created Milk Type group with ${milkGroup.options.length} options`);

      // Create Temperature variant group
      const tempGroup = await prisma.variantGroup.create({
        data: {
          name: 'Temperature',
          productId: latte.id,
          options: {
            create: [
              { name: 'Hot', priceAdjustment: 0.00 },
              { name: 'Iced', priceAdjustment: 0.00 },
              { name: 'Extra Hot', priceAdjustment: 0.25 },
            ]
          }
        },
        include: { options: true }
      });
      console.log(`✅ Created Temperature group with ${tempGroup.options.length} options`);
    } else {
      console.log('✅ Variant groups already exist for this product');
    }

    // Check if extras exist
    const existingExtras = await prisma.extra.count();

    if (existingExtras === 0) {
      console.log('\n2. Creating extras...');

      const extras = await Promise.all([
        prisma.extra.create({
          data: {
            name: 'Extra Shot',
            price: 1.00,
          }
        }),
        prisma.extra.create({
          data: {
            name: 'Caramel Syrup',
            price: 0.75,
          }
        }),
        prisma.extra.create({
          data: {
            name: 'Vanilla Syrup',
            price: 0.75,
          }
        }),
        prisma.extra.create({
          data: {
            name: 'Hazelnut Syrup',
            price: 0.75,
          }
        }),
        prisma.extra.create({
          data: {
            name: 'Whipped Cream',
            price: 0.50,
          }
        }),
        prisma.extra.create({
          data: {
            name: 'Chocolate Sauce',
            price: 0.75,
          }
        }),
      ]);

      console.log(`✅ Created ${extras.length} extras`);
    } else {
      console.log(`\n2. ✅ ${existingExtras} extras already exist`);
    }

    console.log('\n✅ Variant groups and extras seeded successfully!');
    console.log('\nYou can now test the POS system with:');
    console.log('- Multiple variant options (Size, Milk Type, Temperature)');
    console.log('- 6 different extras to add to orders');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVariantsAndExtras()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
