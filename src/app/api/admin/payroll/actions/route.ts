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

        const { employeeId, baseSalary, salaryType } = await request.json();

        if (!employeeId) {
            return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (baseSalary !== undefined) updateData.baseSalary = parseFloat(baseSalary);
        if (salaryType !== undefined) updateData.salaryType = salaryType;

        const employee = await prisma.employee.update({
            where: { id: employeeId },
            data: updateData
        });

        return NextResponse.json({
            message: "Salary configuration updated successfully",
            employee
        });
    } catch (error) {
        console.error("Error updating salary config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
