const { PrismaClient } = require('./prisma/generated/prisma');

const prisma = new PrismaClient();

async function cleanupDuplicateProducts() {
  console.log('Starting cleanup of duplicate products...');

  try {
    // Get all products grouped by name
    const allProducts = await prisma.product.findMany({
      include: {
        recipes: true,
        _count: {
          select: {
            recipes: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Group products by name
    const productGroups = {};
    allProducts.forEach((product) => {
      if (!productGroups[product.name]) {
        productGroups[product.name] = [];
      }
      productGroups[product.name].push(product);
    });

    // Find duplicates
    const duplicateGroups = Object.entries(productGroups).filter(
      ([name, products]) => products.length > 1
    );

    console.log(`Found ${duplicateGroups.length} groups with duplicates:`);
    duplicateGroups.forEach(([name, products]) => {
      console.log(`- ${name}: ${products.length} entries (IDs: ${products.map(p => p.id).join(', ')})`);
    });

    // Process each duplicate group
    for (const [name, products] of duplicateGroups) {
      console.log(`\nProcessing duplicates for: ${name}`);
      
      // Determine which product to keep
      // Priority: has recipes > has basePrice > has description > highest ID
      const bestProduct = products.reduce((best, current) => {
        // Prefer products with recipes
        if (current._count.recipes > best._count.recipes) return current;
        if (current._count.recipes < best._count.recipes) return best;
        
        // If recipe count is equal, prefer products with basePrice
        if (current.basePrice && !best.basePrice) return current;
        if (!current.basePrice && best.basePrice) return best;
        
        // If both have or don't have basePrice, prefer the one with description
        if (current.description && !best.description) return current;
        if (!current.description && best.description) return best;
        
        // If all else is equal, prefer the one with higher ID (more recent)
        return current.id > best.id ? current : best;
      });

      const productsToDelete = products.filter(p => p.id !== bestProduct.id);
      
      console.log(`  Keeping product ID ${bestProduct.id} (${bestProduct._count.recipes} recipes)`);
      console.log(`  Deleting product IDs: ${productsToDelete.map(p => p.id).join(', ')}`);

      // Check for foreign key references before deleting
      for (const productToDelete of productsToDelete) {
        // Check OrderProduct references
        const orderProducts = await prisma.orderProduct.findMany({
          where: { productId: productToDelete.id },
        });

        if (orderProducts.length > 0) {
          console.log(`    Updating ${orderProducts.length} OrderProduct references from ID ${productToDelete.id} to ${bestProduct.id}`);
          await prisma.orderProduct.updateMany({
            where: { productId: productToDelete.id },
            data: { productId: bestProduct.id },
          });
        }

        // Check Sale references
        const sales = await prisma.sale.findMany({
          where: { productId: productToDelete.id },
        });

        if (sales.length > 0) {
          console.log(`    Updating ${sales.length} Sale references from ID ${productToDelete.id} to ${bestProduct.id}`);
          await prisma.sale.updateMany({
            where: { productId: productToDelete.id },
            data: { productId: bestProduct.id },
          });
        }

        // Move recipes if any (though based on data analysis, duplicates don't have recipes)
        if (productToDelete.recipes.length > 0) {
          console.log(`    Moving ${productToDelete.recipes.length} recipes from ID ${productToDelete.id} to ${bestProduct.id}`);
          await prisma.recipe.updateMany({
            where: { productId: productToDelete.id },
            data: { productId: bestProduct.id },
          });
        }
      }

      // Delete the duplicate products
      for (const productToDelete of productsToDelete) {
        await prisma.product.delete({
          where: { id: productToDelete.id },
        });
        console.log(`    Deleted product ID ${productToDelete.id}`);
      }
    }

    console.log('\nCleanup completed successfully!');
    
    // Show final product list
    const finalProducts = await prisma.product.findMany({
      include: {
        _count: {
          select: {
            recipes: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`\nFinal product list (${finalProducts.length} products):`);
    finalProducts.forEach((product) => {
      console.log(`- ${product.name} (ID: ${product.id}, Recipes: ${product._count.recipes})`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateProducts();
