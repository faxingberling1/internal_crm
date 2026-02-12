import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single proposal with full details
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id: params.id },
            include: {
                lead: true,
                items: {
                    include: {
                        package: true,
                    },
                },
            },
        });

        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        return NextResponse.json(proposal);
    } catch (error) {
        console.error('Error fetching proposal:', error);
        return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
    }
}

// PUT update proposal
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, type, status, value, content, brandLogo, signature, proposalDate } = body;

        const proposal = await prisma.proposal.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(status && { status }),
                ...(value !== undefined && { value: parseFloat(value) }),
                ...(content !== undefined && { content }),
                ...(brandLogo !== undefined && { brandLogo }),
                ...(signature !== undefined && { signature }),
                ...(proposalDate !== undefined && { proposalDate }),
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
        console.error('Error updating proposal:', error);
        return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
    }
}

// DELETE proposal
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.proposal.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting proposal:', error);
        return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 });
    }
}
