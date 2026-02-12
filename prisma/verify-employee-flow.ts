import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyFlow() {
    console.log('🧪 Verifying Employee Registration Flow...');

    const testEmail = `tester_${Date.now()}@nbt.com`;
    const password = 'TestPassword123!';
    const name = 'Test Employee';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Creating user and employee for: ${testEmail}`);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: testEmail,
                    password: hashedPassword,
                    name,
                    role: "USER",
                    isApproved: true, // Auto-approve for test
                },
            });

            const employee = await tx.employee.create({
                data: {
                    email: testEmail,
                    name,
                    user: { connect: { id: user.id } },
                },
            });

            return { user, employee };
        });

        console.log('✅ User created:', result.user.id);
        console.log('✅ Employee created:', result.employee.id);
        console.log('🔗 Link verified:', result.employee.userId === result.user.id ? 'SUCCESS' : 'FAILURE');

        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await prisma.employee.delete({ where: { id: result.employee.id } });
        await prisma.user.delete({ where: { id: result.user.id } });
        console.log('✨ Verification Complete!');

    } catch (error: any) {
        console.error('❌ Verification Failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFlow();
