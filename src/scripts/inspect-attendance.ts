import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

async function inspectAttendance() {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'yari@nbt.com' },
            include: {
                employee: {
                    include: {
                        attendance: {
                            orderBy: { checkIn: 'desc' },
                            take: 10
                        }
                    }
                }
            }
        });

        fs.writeFileSync('attendance_inspect.json', JSON.stringify(user, null, 2));
        console.log('✅ Inspection complete. Results saved to attendance_inspect.json');
    } catch (error: any) {
        console.error('❌ Inspection failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectAttendance();
