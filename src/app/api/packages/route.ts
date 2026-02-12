import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all packages
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const packages = await prisma.package.findMany({
            where: {
                isActive: true,
                ...(category && { category }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}

// POST create new package
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, category, price, features } = body;

        // Validate required fields
        if (!name || !category || price === undefined) {
            return NextResponse.json(
                { error: 'Name, category, and price are required' },
                { status: 400 }
            );
        }

        const package_ = await prisma.package.create({
            data: {
                name,
                description,
                category,
                price: parseFloat(price),
                features: JSON.stringify(features || []),
                isActive: true,
            },
        });

        return NextResponse.json(package_, { status: 201 });
    } catch (error) {
        console.error('Error creating package:', error);
        return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
    }
}

// PUT update package
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description, category, price, features, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
        }

        const package_ = await prisma.package.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(category && { category }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(features !== undefined && { features: JSON.stringify(features) }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(package_);
    } catch (error) {
        console.error('Error updating package:', error);
        return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
    }
}

// DELETE package
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
        }

        // Soft delete by setting isActive to false
        await prisma.package.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
    }
}
