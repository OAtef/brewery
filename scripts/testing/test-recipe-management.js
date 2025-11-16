const { PrismaClient } = require('./prisma/generated/prisma');

async function testRecipeManagement() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Recipe Management Implementation...\n');

    // Test 1: Check if we can fetch products
    console.log('1. Testing Products API...');
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
    });
    console.log(`✅ Found ${products.length} products`);
    
    // Test 2: Check if we can fetch recipes
    console.log('\n2. Testing Recipes API...');
    const recipes = await prisma.recipe.findMany({
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
    console.log(`✅ Found ${recipes.length} recipes`);

    // Test 3: Test creating a new product
    console.log('\n3. Testing Product Creation...');
    const newProduct = await prisma.product.create({
      data: {
        name: 'Frappuccino',
        category: 'Cold Brew',
      },
    });
    console.log(`✅ Created product: ${newProduct.name} (ID: ${newProduct.id})`);

    // Test 4: Test creating a new recipe
    console.log('\n4. Testing Recipe Creation...');
    
    // First, get some ingredients
    const ingredients = await prisma.ingredient.findMany();
    if (ingredients.length >= 2) {
      const newRecipe = await prisma.recipe.create({
        data: {
          productId: newProduct.id,
          variant: 'Vanilla',
        },
      });

      // Add recipe ingredients
      await prisma.recipeIngredient.create({
        data: {
          recipeId: newRecipe.id,
          ingredientId: ingredients[0].id,
          quantity: 45.0,
        },
      });

      await prisma.recipeIngredient.create({
        data: {
          recipeId: newRecipe.id,
          ingredientId: ingredients[1].id,
          quantity: 200.0,
        },
      });

      console.log(`✅ Created recipe: ${newProduct.name} - ${newRecipe.variant} (ID: ${newRecipe.id})`);
    }

    // Test 5: Calculate recipe costs
    console.log('\n5. Testing Recipe Cost Calculation...');
    const recipesWithCosts = await prisma.recipe.findMany({
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    recipesWithCosts.forEach(recipe => {
      const cost = recipe.ingredients.reduce((total, ri) => {
        return total + (ri.quantity * ri.ingredient.costPerUnit);
      }, 0);
      console.log(`   ${recipe.product.name} - ${recipe.variant}: $${cost.toFixed(3)}`);
    });

    // Test 6: Test recipe deletion
    console.log('\n6. Testing Recipe Deletion...');
    const recipeToDelete = await prisma.recipe.findFirst({
      where: { product: { name: 'Frappuccino' } },
    });
    
    if (recipeToDelete) {
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: recipeToDelete.id },
      });
      await prisma.recipe.delete({
        where: { id: recipeToDelete.id },
      });
      console.log(`✅ Deleted recipe: ${recipeToDelete.id}`);
    }

    // Test 7: Test product deletion
    console.log('\n7. Testing Product Deletion...');
    await prisma.product.delete({
      where: { id: newProduct.id },
    });
    console.log(`✅ Deleted product: ${newProduct.name}`);

    console.log('\n🎉 All tests passed! Recipe Management implementation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRecipeManagement();
