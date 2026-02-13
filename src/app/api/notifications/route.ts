import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);

        const notifications = await prisma.notification.findMany({
            where: { userId: userData.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}
