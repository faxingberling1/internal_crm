import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month") || "");
        const year = parseInt(searchParams.get("year") || "");

        if (!month || !year) {
            return NextResponse.json({ error: "Month and Year are required" }, { status: 400 });
        }

        const payrolls = await prisma.payroll.findMany({
            where: {
                periodMonth: month,
                periodYear: year
            },
            include: {
                employee: true
            }
        });

        return NextResponse.json(payrolls);
    } catch (error) {
        console.error("Error fetching payroll history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
