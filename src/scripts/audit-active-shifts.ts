import { PrismaClient } from '@prisma/client';

async function checkActiveShifts() {
    const prisma = new PrismaClient();
    try {
        console.log('--- Active Shift Audit ---');
        const activeShifts = await prisma.attendance.findMany({
            where: { checkOut: null },
            include: {
                employee: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (activeShifts.length === 0) {
            console.log('✅ No active shifts found in the database.');
        } else {
            console.log(`⚠️ Found ${activeShifts.length} active shift(s):`);
            activeShifts.forEach(shift => {
                console.log(`- Employee: ${shift.employee.name} (${shift.employee.email})`);
                console.log(`  Clocked In: ${shift.checkIn}`);
                console.log(`  ID: ${shift.id}`);
                console.log(`  On Break: ${shift.isOnBreak ? 'Yes' : 'No'}`);
                console.log('---');
            });
        }
    } catch (error: any) {
        console.error('❌ Audit failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkActiveShifts();
