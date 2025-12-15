const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@coffeeshop.com' },
        update: {},
        create: {
            email: 'admin@coffeeshop.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('✅ Created admin user:', admin.email);
    console.log('   Email: admin@coffeeshop.com');
    console.log('   Password: admin123');

    // Create default packaging if it doesn't exist
    const existingPackaging = await prisma.packaging.findFirst();

    if (!existingPackaging) {
        const packaging = await prisma.packaging.create({
            data: {
                type: 'Standard Cup',
                costPerUnit: 0.5,
                currentStock: 1000,
            },
        });
        console.log('✅ Created default packaging:', packaging.type);
    } else {
        console.log('✅ Default packaging already exists');
    }

    console.log('\n🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
