import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const day = searchParams.get("day");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        let where: any = {};

        if (day && month && year) {
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            where.checkIn = {
                gte: date,
                lt: nextDay
            };
        } else if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 1);
            where.checkIn = {
                gte: startDate,
                lt: endDate
            };
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year) + 1, 0, 1);
            where.checkIn = {
                gte: startDate,
                lt: endDate
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                employee: true,
            },
            orderBy: {
                checkIn: "desc",
            },
        });
        return NextResponse.json(attendance);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { employeeId, type, notes } = await req.json();

        if (type === "CLOCK_IN") {
            const record = await prisma.attendance.create({
                data: {
                    employeeId,
                    checkIn: new Date(),
                    status: "PRESENT",
                    notes,
                },
            });
            return NextResponse.json(record);
        } else if (type === "CLOCK_OUT") {
            // Find the latest open record for this employee
            const latestRecord = await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    checkOut: null,
                },
                orderBy: {
                    checkIn: "desc",
                },
            });

            if (!latestRecord) {
                return NextResponse.json({ error: "No active clock-in found" }, { status: 400 });
            }

            const record = await prisma.attendance.update({
                where: { id: latestRecord.id },
                data: {
                    checkOut: new Date(),
                },
            });
            return NextResponse.json(record);
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log attendance" }, { status: 500 });
    }
}
