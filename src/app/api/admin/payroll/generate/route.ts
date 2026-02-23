import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { startOfMonth, endOfMonth } from "date-fns";

export async function POST(request: Request) {
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

        const { month, year } = await request.json();

        if (!month || !year) {
            return NextResponse.json({ error: "Month and Year are required" }, { status: 400 });
        }

        // Calculate period for the payroll cycle (5th of current month to 5th of next month)
        const periodStart = new Date(year, month - 1, 5);
        const periodEnd = new Date(year, month, 5);
        periodEnd.setHours(23, 59, 59, 999);

        const employees = await prisma.employee.findMany();
        const results = [];

        for (const emp of employees) {
            // Calculate total hours and status counts for the period
            const attendance = await prisma.attendance.findMany({
                where: {
                    employeeId: emp.id,
                    checkIn: { gte: periodStart, lte: periodEnd }
                }
            });

            let totalHours = 0;
            let presents = 0;
            let absents = 0;
            let lates = 0;

            attendance.forEach(record => {
                if (record.status === "PRESENT") presents++;
                else if (record.status === "ABSENT") absents++;
                else if (record.status === "LATE") lates++;

                if (record.checkIn && record.checkOut) {
                    const diff = record.checkOut.getTime() - record.checkIn.getTime();
                    totalHours += diff / (1000 * 60 * 60);
                }
            });

            const baseSalary = emp.baseSalary || 0;
            let netSalary = 0;

            if (emp.salaryType === "HOURLY") {
                netSalary = totalHours * baseSalary;
            } else {
                // Formula: 1 absence = docks pay of 1 day, 3 lates = 1 holiday (1 day pay)
                // Period is assumed to be 30 days
                const dailyRate = baseSalary / 30;
                const absenceDeduction = absents * dailyRate;
                const lateDeduction = Math.floor(lates / 3) * dailyRate;

                netSalary = baseSalary - absenceDeduction - lateDeduction;
                if (netSalary < 0) netSalary = 0;
            }

            // Create or update payroll record
            const payroll = await prisma.payroll.upsert({
                where: {
                    employeeId_periodMonth_periodYear: {
                        employeeId: emp.id,
                        periodMonth: month,
                        periodYear: year
                    }
                },
                update: {
                    baseSalary,
                    totalHours: parseFloat(totalHours.toFixed(2)),
                    presents,
                    absents,
                    lates,
                    netSalary: parseFloat(netSalary.toFixed(2)),
                    status: "GENERATED"
                },
                create: {
                    employeeId: emp.id,
                    periodMonth: month,
                    periodYear: year,
                    baseSalary,
                    totalHours: parseFloat(totalHours.toFixed(2)),
                    presents,
                    absents,
                    lates,
                    netSalary: parseFloat(netSalary.toFixed(2)),
                    status: "GENERATED"
                }
            });

            results.push(payroll);
        }

        return NextResponse.json({
            message: `Payroll generated for ${results.length} employees`,
            payrolls: results
        });
    } catch (error) {
        console.error("Error generating payroll:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
