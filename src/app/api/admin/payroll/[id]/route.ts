import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(
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

        const { id: payrollId } = await params;

        if (!payrollId) {
            return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 });
        }

        await prisma.payroll.delete({
            where: {
                id: payrollId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting payroll:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
