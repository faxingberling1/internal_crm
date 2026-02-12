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
            where: { userId: userData.id },
            include: {
                attendance: {
                    orderBy: { checkIn: "desc" },
                    take: 5
                }
            }
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Error fetching my employee data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
