import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from "date-fns";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);

        const employee = await prisma.employee.findFirst({
            where: { userId: userData.id }
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
        }

        const now = new Date();
        const dayStart = startOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const monthStart = startOfMonth(now);

        // Fetch attendance records for the relevant periods
        const records = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                checkIn: { gte: monthStart }
            }
        });

        const calculateHours = (filteredRecords: any[]) => {
            return filteredRecords.reduce((total, record) => {
                if (!record.checkOut) return total;
                const duration = record.checkOut.getTime() - record.checkIn.getTime();
                return total + (duration / (1000 * 60 * 60));
            }, 0);
        };

        const todayRecords = records.filter(r => r.checkIn >= dayStart);
        const weekRecords = records.filter(r => r.checkIn >= weekStart);
        const monthRecords = records;

        return NextResponse.json({
            today: calculateHours(todayRecords).toFixed(1),
            weekly: calculateHours(weekRecords).toFixed(1),
            monthly: calculateHours(monthRecords).toFixed(1),
            recordCount: records.length
        });
    } catch (error) {
        console.error("Error calculating attendance stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
