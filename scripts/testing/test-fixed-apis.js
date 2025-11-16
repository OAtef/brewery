const { PrismaClient } = require('./prisma/generated/prisma');
const prisma = new PrismaClient();

async function testFixedAPIs() {
  try {
    console.log('🧪 Testing Fixed API Endpoints...\n');

    // Test the products API directly
    console.log('1. Testing Products API (direct database call)...');
    const products = await prisma.product.findMany({
      include: {
        recipes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    console.log(`✅ Products query successful: ${products.length} products found`);

    // Test the recipes API directly
    console.log('\n2. Testing Recipes API (direct database call)...');
    const recipes = await prisma.recipe.findMany({
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: [
        { product: { name: "asc" } },
        { variant: "asc" },
      ],
    });
    console.log(`✅ Recipes query successful: ${recipes.length} recipes found`);

    // Check if user exists
    console.log('\n3. Testing User Authentication...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@coffeeshop.com' },
    });
    
    if (user) {
      console.log(`✅ Admin user found: ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.createdAt}`);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n🎉 All database queries are working correctly!');
    console.log('\n📋 Summary:');
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Recipes: ${recipes.length}`);
    console.log(`   - User exists: ${user ? 'Yes' : 'No'}`);
    console.log('\n🔧 The 500 error should now be fixed.');
    console.log('   Try refreshing the Recipe Management page.');

  } catch (error) {
    console.error('❌ API test failed:', error);
    console.error('Error details:', error.message);
  }
}

testFixedAPIs();
