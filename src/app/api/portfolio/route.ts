import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        // @ts-ignore
        const items = await prisma.portfolioItem.findMany({
            where: category && category !== "ALL" ? { category } : undefined,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("Portfolio GET error:", error);
        return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        if (userData.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, category, clientName, liveUrl, imageUrl, tags, isPublished, completedAt } = body;

        if (!title || !category) {
            return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
        }

        // @ts-ignore
        const item = await prisma.portfolioItem.create({
            data: {
                title,
                description,
                category,
                clientName,
                liveUrl,
                imageUrl,
                tags: tags || [],
                isPublished: isPublished ?? true,
                completedAt: completedAt ? new Date(completedAt) : null,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Portfolio POST error:", error);
        return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        if (userData.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, description, category, clientName, liveUrl, imageUrl, tags, isPublished, completedAt } = body;

        if (!id) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        // @ts-ignore
        const item = await prisma.portfolioItem.update({
            where: { id },
            data: {
                title,
                description,
                category,
                clientName,
                liveUrl,
                imageUrl,
                tags: tags || [],
                isPublished: isPublished ?? true,
                completedAt: completedAt ? new Date(completedAt) : null,
            },
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error("Portfolio PUT error:", error);
        return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        if (userData.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        // @ts-ignore
        await prisma.portfolioItem.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Portfolio DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
    }
}
