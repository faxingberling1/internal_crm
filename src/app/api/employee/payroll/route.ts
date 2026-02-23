import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

        const payrolls = await prisma.payroll.findMany({
            where: {
                employeeId: employee.id,
                isShared: true
            },
            orderBy: [
                { periodYear: "desc" },
                { periodMonth: "desc" }
            ]
        });

        return NextResponse.json({ employee, payrolls });
    } catch (error) {
        console.error("Error fetching payroll history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
