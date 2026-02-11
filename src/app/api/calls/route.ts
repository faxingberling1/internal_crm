import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const calls = await prisma.call.findMany({
            include: { lead: true },
            orderBy: { timestamp: "desc" },
        });
        return NextResponse.json(calls);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const call = await prisma.call.create({
            data: {
                leadId: json.leadId,
                duration: parseInt(json.duration) || 0,
                status: json.status,
                notes: json.notes,
            },
        });
        return NextResponse.json(call);
    } catch (error) {
        return NextResponse.json({ error: "Failed to log call" }, { status: 500 });
    }
}
