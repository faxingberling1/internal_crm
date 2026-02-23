import { PrismaClient } from '@prisma/client';

async function auditUserEmployeeLink() {
    const prisma = new PrismaClient();
    try {
        console.log('--- User-Employee Audit ---');
        const users = await prisma.user.findMany({
            include: {
                employee: true
            }
        });

        users.forEach(user => {
            console.log(`User: ${user.email} (ID: ${user.id})`);
            if (user.employee) {
                console.log(`  ✅ Employee: ${user.employee.name} (ID: ${user.employee.id})`);
                if (user.employee.userId !== user.id) {
                    console.log(`  ❌ Relation mismatch! Employee userId (${user.employee.userId}) != user.id (${user.id})`);
                }
            } else {
                console.log('  ❌ No employee profile linked.');
            }
            console.log('---');
        });

        // Also check for orphaned employees
        const orphanedEmployees = await prisma.employee.findMany({
            where: { userId: null }
        });
        if (orphanedEmployees.length > 0) {
            console.log(`⚠️ Found ${orphanedEmployees.length} orphaned employee(s) (no userId).`);
        }
    } catch (error: any) {
        console.error('❌ Audit failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

auditUserEmployeeLink();
