import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(clients);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const client = await prisma.client.create({
            data: {
                name: json.name,
                company: json.company,
                email: json.email,
                phone: json.phone,
                website: json.website,
            },
        });
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
