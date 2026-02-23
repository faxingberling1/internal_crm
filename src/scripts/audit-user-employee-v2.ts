import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

async function auditUserEmployeeLink() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            include: {
                employee: true
            }
        });

        const results = users.map(user => ({
            email: user.email,
            id: user.id,
            hasEmployee: !!user.employee,
            employeeName: user.employee?.name,
            employeeId: user.employee?.id,
            userIdMatch: user.employee ? user.employee.userId === user.id : 'N/A'
        }));

        const orphanedEmployees = await prisma.employee.findMany({
            where: { userId: null }
        });

        const finalOutput = {
            users: results,
            orphanedEmployees: orphanedEmployees.map(e => ({ name: e.name, id: e.id }))
        };

        fs.writeFileSync('audit_results.json', JSON.stringify(finalOutput, null, 2));
        console.log('✅ Audit complete. Results saved to audit_results.json');
    } catch (error: any) {
        console.error('❌ Audit failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

auditUserEmployeeLink();
