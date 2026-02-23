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

        // Fetch all unique roles from employees
        const roles = await prisma.employee.findMany({
            select: {
                position: true
            },
            distinct: ['position']
        });

        // Filter out null positions and return unique values
        const uniqueRoles = roles
            .map(r => r.position)
            .filter(Boolean)
            .sort();

        return NextResponse.json(uniqueRoles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
