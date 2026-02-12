const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        const employees = await prisma.employee.findMany();
        const attendance = await prisma.attendance.findMany({
            include: { employee: true },
            orderBy: { checkIn: 'desc' }
        });

        console.log('=== Database Audit ===');
        console.log(`Total Users: ${users.length}`);
        console.log(`Total Employees: ${employees.length}`);
        console.log(`Total Attendance Records: ${attendance.length}`);

        const activeShifts = attendance.filter(a => !a.checkOut);
        console.log(`Active Shifts: ${activeShifts.length}`);

        if (users.length > 0) {
            console.log('\nUsers List:');
            users.forEach(u => console.log(` - ${u.email} (${u.role})`));
        }

        if (activeShifts.length > 0) {
            console.log('\nActive Shift Details:');
            activeShifts.forEach(s => {
                console.log(` - Employee: ${s.employee.email}`);
                console.log(`   Check-in: ${s.checkIn}`);
                console.log(`   On Break: ${s.isOnBreak}`);
            });
        } else {
            console.log('\n!!! No active shifts found in database !!!');
        }

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
