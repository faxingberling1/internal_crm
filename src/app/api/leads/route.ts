import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const lead = await prisma.lead.create({
            data: {
                name: json.name,
                email: json.email,
                phone: json.phone,
                status: json.status || "NEW",
                source: json.source,
                notes: json.notes,
            },
        });
        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }
}
