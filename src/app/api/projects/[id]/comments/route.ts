import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const comments = await prisma.comment.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(comments);
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        const { id: projectId } = await params;
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                projectId,
                authorId: userData.id,
                authorName: userData.name || userData.email
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error: any) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
