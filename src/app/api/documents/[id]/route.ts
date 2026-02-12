import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                lead: true,
                client: true,
                template: true,
                versions: true,
                parent: true,
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();

        const document = await prisma.document.update({
            where: { id },
            data: {
                name: json.name,
                status: json.status,
                brandLogo: json.brandLogo,
                brandColors: json.brandColors,
                clientLogo: json.clientLogo,
                clientBrandColors: json.clientBrandColors,
                content: json.content,
                value: json.value ? parseFloat(json.value) : undefined,
                validUntil: json.validUntil,
                signature: json.signature,
                signedAt: json.signedAt,
                signedBy: json.signedBy,
            },
            include: {
                lead: true,
                client: true,
                template: true,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.document.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
