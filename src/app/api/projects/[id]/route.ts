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

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                tasks: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error: any) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

export async function PATCH(
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
        const body = await req.json();

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.color !== undefined) updateData.color = body.color;
        if (body.leadId !== undefined) updateData.leadId = body.leadId;
        if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
        if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.progress !== undefined) updateData.progress = body.progress;

        // Auto-set completedAt when status changes to COMPLETED
        if (body.status === "COMPLETED" && !body.completedAt) {
            updateData.completedAt = new Date();
        }

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tasks: true
            }
        });

        return NextResponse.json(project);
    } catch (error: any) {
        console.error("Error updating project:", error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
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

        await prisma.project.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
