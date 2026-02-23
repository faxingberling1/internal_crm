import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        if (userData.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id: employeeId } = await params;
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month") || "");
        const year = parseInt(searchParams.get("year") || "");

        if (!month || !year) {
            return NextResponse.json({ error: "Month and Year are required" }, { status: 400 });
        }

        // Calculate date range for the payroll cycle (5th of current month to 5th of next month)
        const startDate = new Date(year, month - 1, 5);
        const endDate = new Date(year, month, 5);
        endDate.setHours(23, 59, 59, 999);

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                employeeId,
                checkIn: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const stats = {
            present: attendanceRecords.filter(r => r.status === "PRESENT").length,
            late: attendanceRecords.filter(r => r.status === "LATE").length,
            absent: attendanceRecords.filter(r => r.status === "ABSENT").length,
            totalHours: attendanceRecords.reduce((total, record) => {
                if (!record.checkOut) return total;
                const duration = record.checkOut.getTime() - record.checkIn.getTime();
                return total + (duration / (1000 * 60 * 60));
            }, 0),
            breakHours: attendanceRecords.reduce((total, record) => {
                if (!record.breakStart || !record.breakEnd) return total;
                const duration = record.breakEnd.getTime() - record.breakStart.getTime();
                return total + (duration / (1000 * 60 * 60));
            }, 0)
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching employee attendance stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
