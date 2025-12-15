const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`Total products: ${count}`);
  
  if (count > 0) {
    const products = await prisma.product.findMany({ take: 3 });
    console.log('Sample products:', products.map(p => ({ id: p.id, name: p.name })));
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
