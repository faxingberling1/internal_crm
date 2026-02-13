import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notifyAdmins } from "@/lib/notifications";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const day = searchParams.get("day");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userData = JSON.parse(session.value);

        // Build query filter
        let where: any = {};

        // 1. Authorization: Non-admins can only see their own attendance
        if (userData.role !== "ADMIN") {
            const employee = await prisma.employee.findUnique({
                where: { userId: userData.id }
            });
            if (!employee) return NextResponse.json([]);
            where.employeeId = employee.id;
        }

        // 2. Date Filtering
        if (year || month || day) {
            const targetYear = parseInt(year || new Date().getFullYear().toString());
            const targetMonth = month ? parseInt(month) - 1 : undefined;
            const targetDay = day ? parseInt(day) : undefined;

            let startDate: Date;
            let endDate: Date;

            if (targetDay !== undefined && targetMonth !== undefined) {
                // Specific Day
                startDate = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);
                endDate = new Date(targetYear, targetMonth, targetDay, 23, 59, 59);
            } else if (targetMonth !== undefined) {
                // Entire Month
                startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0);
                endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
            } else {
                // Entire Year
                startDate = new Date(targetYear, 0, 1, 0, 0, 0);
                endDate = new Date(targetYear, 12, 0, 23, 59, 59);
            }

            where.checkIn = {
                gte: startDate,
                lte: endDate
            };
        }

        const records = await prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                checkIn: "desc"
            }
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("GET Attendance Error:", error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userData = JSON.parse(session.value);
        const { employeeId, type, notes } = await req.json();

        // Get employee info for notification message
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { user: true }
        });

        if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

        // Validation: Verify the employeeId belongs to the user if they're not an admin
        if (userData.role !== "ADMIN") {
            if (employee.userId !== userData.id) {
                return NextResponse.json({ error: "Forbidden: You can only log your own attendance" }, { status: 403 });
            }
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (type === "CLOCK_IN") {
            // Check if there's already an active shift
            const activeShift = await prisma.attendance.findFirst({
                where: { employeeId, checkOut: null }
            });

            if (activeShift) return NextResponse.json({ error: "An active shift is already in progress" }, { status: 400 });

            const record = await prisma.attendance.create({
                data: {
                    employeeId,
                    checkIn: now,
                    status: "PRESENT",
                    notes: notes || "Shift Started",
                },
            });

            await notifyAdmins({
                title: "Shift Started",
                message: `${employee.name} clocked in at ${timeStr}`,
                type: "ATTENDANCE",
                link: `/admin/attendance` // Assuming admin attendance page exists
            });

            return NextResponse.json(record);
        } else if (type === "CLOCK_OUT") {
            const latestRecord = await prisma.attendance.findFirst({
                where: { employeeId, checkOut: null },
                orderBy: { checkIn: "desc" },
            });

            if (!latestRecord) return NextResponse.json({ error: "No active shift found" }, { status: 400 });

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    checkOut: now,
                    isOnBreak: false,
                    breakEnd: latestRecord.isOnBreak ? now : latestRecord.breakEnd
                },
            });

            await notifyAdmins({
                title: "Shift Ended",
                message: `${employee.name} clocked out at ${timeStr}`,
                type: "ATTENDANCE",
                link: `/admin/attendance`
            });

            return NextResponse.json(record);
        } else if (type === "BREAK_START") {
            const latestRecord = await prisma.attendance.findFirst({
                where: { employeeId, checkOut: null },
                orderBy: { checkIn: "desc" },
            });

            if (!latestRecord) return NextResponse.json({ error: "No active shift found" }, { status: 400 });

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    breakStart: now,
                    isOnBreak: true
                },
            });

            await notifyAdmins({
                title: "Break Started",
                message: `${employee.name} went on break at ${timeStr}`,
                type: "ATTENDANCE",
                link: `/admin/attendance`
            });

            return NextResponse.json(record);
        } else if (type === "BREAK_END") {
            const latestRecord = await prisma.attendance.findFirst({
                where: { employeeId, checkOut: null, isOnBreak: true },
                orderBy: { checkIn: "desc" },
            });

            if (!latestRecord) return NextResponse.json({ error: "No active break found" }, { status: 400 });

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    breakEnd: now,
                    isOnBreak: false
                },
            });

            await notifyAdmins({
                title: "Break Ended",
                message: `${employee.name} returned from break at ${timeStr}`,
                type: "ATTENDANCE",
                link: `/admin/attendance`
            });

            return NextResponse.json(record);
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error("Attendance Error:", error);
        return NextResponse.json({ error: "Failed to log attendance" }, { status: 500 });
    }
}
