import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

        const body = await request.json();
        const { payrollId, employeeId, month, year, bonus, commission, deductions, status, isShared, presents, absents, lates, baseSalary: baseSalaryOverride } = body;

        if (!payrollId && (!employeeId || !month || !year)) {
            return NextResponse.json({ error: "Payroll ID or (EmployeeID, Month, Year) required" }, { status: 400 });
        }

        let targetPayrollId = payrollId;

        // If no ID, find existing or prepare to create
        if (!targetPayrollId) {
            const existing = await prisma.payroll.findUnique({
                where: {
                    employeeId_periodMonth_periodYear: {
                        employeeId,
                        periodMonth: month,
                        periodYear: year
                    }
                }
            });

            if (existing) {
                targetPayrollId = existing.id;
            } else {
                // Create new record
                const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
                if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

                const baseSalary = baseSalaryOverride ?? (employee.baseSalary || 0);

                // If base salary is overridden, update the employee record as well
                if (baseSalaryOverride !== undefined && baseSalaryOverride !== employee.baseSalary) {
                    await prisma.employee.update({
                        where: { id: employeeId },
                        data: { baseSalary: baseSalaryOverride }
                    });
                }

                // Calculate Net Salary for new record
                // Formula: 1 absence = -1 day, 3 lates = -1 day
                const dailyRate = baseSalary / 30;
                const formulaDeductions = ((absents || 0) * dailyRate) + (Math.floor((lates || 0) / 3) * dailyRate);
                const finalNetSalary = (baseSalary - formulaDeductions + (bonus || 0) + (commission || 0)) - (deductions || 0);

                const newPayroll = await prisma.payroll.create({
                    data: {
                        employeeId,
                        periodMonth: month,
                        periodYear: year,
                        baseSalary,
                        totalHours: body.totalHours || 0, // Should be passed from frontend
                        presents: presents || 0,
                        absents: absents || 0,
                        lates: lates || 0,
                        bonus: bonus || 0,
                        commission: commission || 0,
                        deductions: deductions || 0,
                        netSalary: parseFloat(finalNetSalary.toFixed(2)),
                        status: status || "FINALIZED",
                        isShared: isShared ?? true
                    }
                });

                return NextResponse.json(newPayroll);
            }
        }

        const existingPayroll = await prisma.payroll.findUnique({
            where: { id: targetPayrollId }
        });

        if (!existingPayroll) {
            return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
        }

        // Use overrides or existing database values
        const finalPresents = presents ?? existingPayroll.presents;
        const finalAbsents = absents ?? existingPayroll.absents;
        const finalLates = lates ?? existingPayroll.lates;
        const finalBaseSalary = baseSalaryOverride ?? existingPayroll.baseSalary;

        // If base salary is overridden, update the employee record as well
        if (baseSalaryOverride !== undefined && baseSalaryOverride !== existingPayroll.baseSalary) {
            await prisma.employee.update({
                where: { id: existingPayroll.employeeId },
                data: { baseSalary: baseSalaryOverride }
            });
        }

        // Calculate final net salary including the advanced formula (1 absence = -1 day, 3 lates = -1 day)
        const dailyRate = finalBaseSalary / 30;
        const formulaDeductions = (finalAbsents * dailyRate) + (Math.floor(finalLates / 3) * dailyRate);
        const finalNetSalary = (finalBaseSalary - formulaDeductions + (bonus || 0) + (commission || 0)) - (deductions || 0);

        const updatedPayroll = await prisma.payroll.update({
            where: { id: targetPayrollId },
            data: {
                bonus: bonus || 0,
                commission: commission || 0,
                deductions: deductions || 0,
                presents: finalPresents,
                absents: finalAbsents,
                lates: finalLates,
                baseSalary: finalBaseSalary,
                netSalary: parseFloat(finalNetSalary.toFixed(2)),
                status: status || "FINALIZED",
                isShared: isShared ?? true
            }
        });

        return NextResponse.json(updatedPayroll);
    } catch (error) {
        console.error("Error finalizing payroll:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
