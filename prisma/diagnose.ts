import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
    console.log('🔍 Diagnosing MongoDB Connection...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to MongoDB');

        const userCount = await prisma.user.count();
        console.log(`📊 Total users in database: ${userCount}`);

        const admin = await prisma.user.findUnique({
            where: { email: 'admin@nbt.com' }
        });

        if (admin) {
            console.log('✅ Admin user (admin@nbt.com) found');
            console.log('Approval Status:', admin.isApproved);
        } else {
            console.log('❌ Admin user (admin@nbt.com) NOT found');
            console.log('Searching for any user...');
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                console.log('Found user with email:', firstUser.email);
            } else {
                console.log('Database is completely empty!');
            }
        }

    } catch (error: any) {
        console.error('❌ Connection Failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
