import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const template = await prisma.proposalTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();

        const template = await prisma.proposalTemplate.update({
            where: { id },
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
                isActive: json.isActive,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.proposalTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
