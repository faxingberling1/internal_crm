import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/documents/[id]/versions - List all versions (snapshots)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const versions = await prisma.document.findMany({
            where: {
                parentId: id,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(versions);
    } catch (error) {
        console.error('Error fetching document versions:', error);
        return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
    }
}

// POST /api/documents/[id]/versions - Create a version snapshot of current state
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Get current document state
        const currentDoc = await prisma.document.findUnique({
            where: { id },
        });

        if (!currentDoc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // 2. Create snapshot record (child)
        const snapshot = await prisma.document.create({
            data: {
                type: currentDoc.type,
                name: `${currentDoc.name} (Snapshot v${currentDoc.version})`,
                status: currentDoc.status,
                parentId: currentDoc.id,
                content: currentDoc.content as any,
                value: currentDoc.value,
                brandLogo: currentDoc.brandLogo,
                brandColors: currentDoc.brandColors as any,
                clientLogo: currentDoc.clientLogo,
                clientBrandColors: currentDoc.clientBrandColors as any,
                version: currentDoc.version, // Snapshot carries the version number it represents
                validUntil: currentDoc.validUntil,
                leadId: currentDoc.leadId,
                clientId: currentDoc.clientId,
            }
        });

        return NextResponse.json(snapshot);
    } catch (error) {
        console.error('Error creating document version:', error);
        return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
    }
}
