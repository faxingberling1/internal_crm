import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const category = searchParams.get('category');

        const templates = await prisma.documentTemplate.findMany({
            where: {
                isActive: true,
                ...(type && { type: type as any }),
                ...(category && { category }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching document templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();

        const template = await prisma.documentTemplate.create({
            data: {
                type: json.type,
                name: json.name,
                category: json.category,
                description: json.description,
                content: json.content,
                defaultValidDays: json.defaultValidDays,
                requiresSignature: json.requiresSignature !== undefined ? json.requiresSignature : false,
                isActive: json.isActive !== undefined ? json.isActive : true,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error creating document template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
