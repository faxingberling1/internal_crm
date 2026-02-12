import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const proposals = await prisma.proposal.findMany({
            include: {
                lead: true,
                items: {
                    include: {
                        package: true,
                    },
                },
            },
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

        // Create proposal with all custom fields and package items
        const proposal = await prisma.proposal.create({
            data: {
                name: json.name,
                type: json.type,
                status: json.status || "DRAFT",
                value: parseFloat(json.value) || 0,
                content: json.content,
                brandLogo: json.brandLogo,
                signature: json.signature,
                proposalDate: json.proposalDate,

                // New custom fields
                customFields: json.customFields || undefined,
                brandColors: json.brandColors || undefined,
                headerText: json.headerText,
                footerText: json.footerText,
                terms: json.terms,
                notes: json.notes,

                leadId: json.leadId,
                items: json.packages ? {
                    create: json.packages.map((item: any) => ({
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
