import { PrismaClient } from '@prisma/client';

async function checkActiveShiftsV2() {
    const prisma = new PrismaClient();
    try {
        console.log('--- Active Shift Audit (All Records) ---');
        // Get ALL attendance records and filter in JS to be safe against DB-specific null behaviors
        const allAttendance = await prisma.attendance.findMany({
            include: {
                employee: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        const activeShifts = allAttendance.filter(a => a.checkOut === null);

        if (activeShifts.length === 0) {
            console.log('✅ No active shifts found by JS filtering.');
        } else {
            console.log(`⚠️ Found ${activeShifts.length} active shift(s) via JS filtering:`);
            activeShifts.forEach(shift => {
                console.log(`- Employee: ${shift.employee?.name || 'Unknown'} (${shift.employee?.email || 'Unknown'})`);
                console.log(`  Clocked In: ${shift.checkIn}`);
                console.log(`  ID: ${shift.id}`);
                console.log('---');
            });
        }

        console.log(`Total Attendance Records: ${allAttendance.length}`);
    } catch (error: any) {
        console.error('❌ Audit failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkActiveShiftsV2();
