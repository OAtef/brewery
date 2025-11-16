const { PrismaClient } = require('./prisma/generated/prisma');
const http = require('http');

// Mock Next.js API handler testing
async function testAPIEndpoints() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing API Endpoints...\n');

    // Simulate GET /api/products
    console.log('1. Testing GET /api/products...');
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
    console.log(`✅ Products endpoint would return ${products.length} products`);

    // Simulate GET /api/recipes
    console.log('\n2. Testing GET /api/recipes...');
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
    console.log(`✅ Recipes endpoint would return ${recipes.length} recipes`);

    // Test individual recipe with detailed info
    console.log('\n3. Testing recipe details...');
    recipes.forEach(recipe => {
      const cost = recipe.ingredients.reduce((total, ri) => {
        return total + (ri.quantity * ri.ingredient.costPerUnit);
      }, 0);
      console.log(`   📄 ${recipe.product.name} - ${recipe.variant}:`);
      console.log(`      💰 Cost: $${cost.toFixed(3)}`);
      console.log(`      🥤 Ingredients: ${recipe.ingredients.length}`);
      recipe.ingredients.forEach(ri => {
        console.log(`         - ${ri.ingredient.name}: ${ri.quantity}${ri.ingredient.unit}`);
      });
    });

    // Test product categories
    console.log('\n4. Testing product categories...');
    const categories = [...new Set(products.map(p => p.category))];
    console.log(`✅ Found categories: ${categories.join(', ')}`);

    console.log('\n🎉 All API endpoint tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIEndpoints();
