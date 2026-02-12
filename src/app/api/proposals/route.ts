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

        // Create proposal with package items in a transaction
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
                items: json.items ? {
                    create: json.items.map((item: any) => ({
                        packageId: item.packageId,
                        quantity: item.quantity || 1,
                        price: parseFloat(item.price),
                    })),
                } : undefined,
            },
            include: {
                lead: true,
                items: {
                    include: {
                        package: true,
                    },
                },
            },
        });

        return NextResponse.json(proposal);
    } catch (error) {
        console.error("Failed to create proposal:", error);
        return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }
}
