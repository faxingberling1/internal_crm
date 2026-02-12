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
        if (userData.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const employees = await prisma.employee.findMany({
            include: {
                user: true,
                _count: {
                    select: { attendance: true }
                }
            } as any,
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error("Error fetching admin employee list:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
