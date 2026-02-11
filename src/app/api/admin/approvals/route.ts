import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: { isApproved: false },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(pendingUsers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch pending users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, action } = await req.json();

        if (action === "APPROVE") {
            const user = await prisma.user.update({
                where: { id: userId },
                data: { isApproved: true },
            });
            return NextResponse.json(user);
        } else if (action === "REJECT") {
            await prisma.user.delete({
                where: { id: userId },
            });
            return NextResponse.json({ message: "User rejected and deleted" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
    }
}
