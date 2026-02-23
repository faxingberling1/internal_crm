const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to access prisma.payroll...');
        const count = await prisma.payroll.count();
        console.log('Successfully counted payrolls:', count);

        // Also check if we can query by composite key, just to be sure
        // We won't actually query a specific one, just checking if the model definition is loaded
        console.log('Prisma Client is working correctly.');
    } catch (e) {
        console.error('Error accessing payroll:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
