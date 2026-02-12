import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userData = JSON.parse(session.value);
        const { searchParams } = new URL(req.url);
        const day = searchParams.get("day");
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const employeeIdParam = searchParams.get("employeeId");

        let where: any = {};

        // Force employees to only see their own records
        if (userData.role !== "ADMIN") {
            const employee = await prisma.employee.findFirst({
                where: { userId: userData.id }
            });
            if (!employee) return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
            where.employeeId = employee.id;
        } else if (employeeIdParam) {
            where.employeeId = employeeIdParam;
        }

        if (day && month && year) {
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            where.checkIn = { gte: date, lt: nextDay };
        } else if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 1);
            where.checkIn = { gte: startDate, lt: endDate };
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year) + 1, 0, 1);
            where.checkIn = { gte: startDate, lt: endDate };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: { employee: true },
            orderBy: { checkIn: "desc" },
        });

        return NextResponse.json(attendance);
    } catch (error) {
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

        // Validation: Verify the employeeId belongs to the user if they're not an admin
        if (userData.role !== "ADMIN") {
            const employee = await prisma.employee.findFirst({
                where: { userId: userData.id }
            });
            if (!employee || employee.id !== employeeId) {
                return NextResponse.json({ error: "Forbidden: You can only log your own attendance" }, { status: 403 });
            }
        }

        if (type === "CLOCK_IN") {
            // Check if there's already an active shift to prevent duplicates
            const activeShift = await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    checkOut: null,
                }
            });

            if (activeShift) {
                return NextResponse.json({ error: "An active shift is already in progress" }, { status: 400 });
            }

            const record = await prisma.attendance.create({
                data: {
                    employeeId,
                    checkIn: new Date(),
                    status: "PRESENT",
                    notes: notes || "Shift Started",
                    checkOut: null,
                    breakStart: null,
                    breakEnd: null,
                },
            });
            return NextResponse.json(record);
        } else if (type === "CLOCK_OUT") {
            const latestRecord = await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    checkOut: null,
                },
                orderBy: { checkIn: "desc" },
            });

            if (!latestRecord) {
                return NextResponse.json({ error: "No active shift found" }, { status: 400 });
            }

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    checkOut: new Date(),
                    isOnBreak: false, // Ensure break is ended if shift ends
                    breakEnd: latestRecord.isOnBreak ? new Date() : latestRecord.breakEnd
                },
            });
            return NextResponse.json(record);
        } else if (type === "BREAK_START") {
            const latestRecord = await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    checkOut: null,
                },
                orderBy: { checkIn: "desc" },
            });

            if (!latestRecord) {
                return NextResponse.json({ error: "No active shift found to start break" }, { status: 400 });
            }

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    breakStart: new Date(),
                    isOnBreak: true
                },
            });
            return NextResponse.json(record);
        } else if (type === "BREAK_END") {
            const latestRecord = await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    checkOut: null,
                    isOnBreak: true
                },
                orderBy: { checkIn: "desc" },
            });

            if (!latestRecord) {
                return NextResponse.json({ error: "No active break found" }, { status: 400 });
            }

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    breakEnd: new Date(),
                    isOnBreak: false
                },
            });
            return NextResponse.json(record);
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log attendance" }, { status: 500 });
    }
}
