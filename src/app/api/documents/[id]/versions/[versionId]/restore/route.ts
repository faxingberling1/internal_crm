import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/documents/[id]/versions/[versionId]/restore - Revert main document to a specific snapshot
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string, versionId: string }> }
) {
    try {
        const { id, versionId } = await params;

        // 1. Get the snapshot to restore
        const snapshot = await prisma.document.findUnique({
            where: { id: versionId },
        });

        if (!snapshot || snapshot.parentId !== id) {
            return NextResponse.json({ error: 'Snapshot not found or does not belong to this document' }, { status: 404 });
        }

        // 2. Get current main document
        const mainDoc = await prisma.document.findUnique({
            where: { id },
        });

        if (!mainDoc) {
            return NextResponse.json({ error: 'Main document not found' }, { status: 404 });
        }

        // 3. Create a "Safety Snapshot" of current state before restoring
        await prisma.document.create({
            data: {
                type: mainDoc.type,
                name: `${mainDoc.name} (Pre-Restore Snapshot v${mainDoc.version})`,
                status: mainDoc.status,
                parentId: mainDoc.id,
                content: mainDoc.content,
                value: mainDoc.value,
                brandLogo: mainDoc.brandLogo,
                brandColors: mainDoc.brandColors,
                clientLogo: mainDoc.clientLogo,
                clientBrandColors: mainDoc.clientBrandColors,
                version: mainDoc.version,
                validUntil: mainDoc.validUntil,
                leadId: mainDoc.leadId,
                clientId: mainDoc.clientId,
            }
        });

        // 4. Update main document with snapshot content
        const updatedDoc = await prisma.document.update({
            where: { id },
            data: {
                content: snapshot.content,
                value: snapshot.value,
                brandLogo: snapshot.brandLogo,
                brandColors: snapshot.brandColors,
                clientLogo: snapshot.clientLogo,
                clientBrandColors: snapshot.clientBrandColors,
                version: mainDoc.version + 1, // Increment version counter
                validUntil: snapshot.validUntil,
            }
        });

        return NextResponse.json(updatedDoc);
    } catch (error) {
        console.error('Error restoring document version:', error);
        return NextResponse.json({ error: 'Failed to restore snapshot' }, { status: 500 });
    }
}
