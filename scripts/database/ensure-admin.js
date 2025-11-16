#!/usr/bin/env node
/**
 * Standalone script to ensure admin user exists
 * Can be run independently if needed
 */

const { PrismaClient } = require('@prisma/client');

async function ensureAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Ensuring admin user exists...\n');

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
    console.log('\nYou can now login to the application with these credentials.');
    
  } catch (error) {
    console.error('❌ Failed to ensure admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureAdminUser();
