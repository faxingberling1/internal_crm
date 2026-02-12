import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const clientId = searchParams.get('clientId');
        const leadId = searchParams.get('leadId');

        const documents = await prisma.document.findMany({
            where: {
                ...(type && { type: type as any }),
                ...(status && { status: status as any }),
                ...(clientId && { clientId }),
                ...(leadId && { leadId }),
            },
            include: {
                lead: true,
                client: true,
                template: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();

        const document = await prisma.document.create({
            data: {
                type: json.type,
                name: json.name,
                status: json.status || 'DRAFT',
                leadId: json.leadId,
                clientId: json.clientId,
                brandName: json.brandName,
                brandLogo: json.brandLogo,
                brandColors: json.brandColors,
                clientLogo: json.clientLogo,
                clientBrandColors: json.clientBrandColors,
                content: json.content,
                value: json.value ? parseFloat(json.value) : undefined,
                validUntil: json.validUntil,
                signature: json.signature,
                templateId: json.templateId,
                version: 1,
                createdBy: json.createdBy,
            },
            include: {
                lead: true,
                client: true,
                template: true,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
