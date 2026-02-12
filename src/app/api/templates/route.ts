import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const templates = await prisma.proposalTemplate.findMany({
            where: {
                isActive: true,
                ...(category && { category }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Check admin authorization (you can add session check here)
        const json = await request.json();

        const template = await prisma.proposalTemplate.create({
            data: {
                name: json.name,
                category: json.category,
                description: json.description,
                projectOverview: json.projectOverview,
                objectives: json.objectives,
                scopeOfWork: json.scopeOfWork,
                timeline: json.timeline,
                deliverables: json.deliverables,
                paymentTerms: json.paymentTerms,
                nextSteps: json.nextSteps,
                terms: json.terms,
                isActive: json.isActive !== undefined ? json.isActive : true,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
