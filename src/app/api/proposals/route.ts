import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const proposals = await prisma.proposal.findMany({
            include: { lead: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(proposals);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const proposal = await prisma.proposal.create({
            data: {
                name: json.name,
                type: json.type,
                status: json.status || "DRAFT",
                value: parseFloat(json.value) || 0,
                content: json.content,
                brandLogo: json.brandLogo,
                signature: json.signature,
                proposalDate: json.date,
                leadId: json.leadId,
            },
        });
        return NextResponse.json(proposal);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }
}
