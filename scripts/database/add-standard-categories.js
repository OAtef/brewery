const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addStandardCategories() {
    try {
        console.log('🏷️  Adding standard categories...\n');

        const categories = ['Coffee', 'Non-Coffee', 'Food', 'Seasonal'];

        for (const categoryName of categories) {
            const result = await prisma.category.upsert({
                where: { name: categoryName },
                update: {},
                create: { name: categoryName }
            });

            console.log(`✅ ${result.name} category ready (ID: ${result.id})`);
        }

        console.log('\n✅ All standard categories added successfully!');
        console.log('\nCategories:');
        const allCategories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });

        allCategories.forEach(cat => {
            console.log(`  - ${cat.name}`);
        });

    } catch (error) {
        console.error('❌ Error adding categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

addStandardCategories();
