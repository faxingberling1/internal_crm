import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminUser() {
    console.log('🌱 Seeding admin user...');

    const adminEmail = 'admin@nbt.com';
    const adminPassword = 'Admin123!'; // Change this in production!

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            isApproved: true,
        },
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');
}

seedAdminUser()
    .catch((e) => {
        console.error('❌ Error seeding admin user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
