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

        const { payrollId } = await request.json();

        if (!payrollId) {
            return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 });
        }

        const existingPayroll = await prisma.payroll.findUnique({
            where: { id: payrollId }
        });

        if (!existingPayroll) {
            return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
        }

        const updatedPayroll = await prisma.payroll.update({
            where: { id: payrollId },
            data: {
                isShared: false,
                status: "REVIEW" // Revert to review status
            }
        });

        return NextResponse.json(updatedPayroll);
    } catch (error) {
        console.error("Error redacting payroll:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
