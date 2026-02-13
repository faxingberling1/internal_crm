import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;

        // Fetch project to get current assignees
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { assignedTo: true }
        });

        // Fetch all approved workers to select from
        const employees = await prisma.employee.findMany({
            include: { user: true }
        });

        return NextResponse.json({
            currentAssignees: project?.assignedTo || [],
            allMembers: employees.map(emp => ({
                id: emp.userId,
                name: emp.name,
                email: emp.email,
                position: emp.position,
                initials: emp.name.split(' ').map(n => n[0]).join('').toUpperCase()
            }))
        });
    } catch (error: any) {
        console.error("Error fetching assignees:", error);
        return NextResponse.json({ error: "Failed to fetch assignees" }, { status: 500 });
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
        const { userIds } = await req.json();

        if (!Array.isArray(userIds)) {
            return NextResponse.json({ error: "userIds must be an array" }, { status: 400 });
        }

        // Get project name for notification
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true, assignedTo: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Identify newly assigned users to notify
        const newAssignees = userIds.filter(id => !project.assignedTo.includes(id));

        // Update project assignees
        await prisma.project.update({
            where: { id: projectId },
            data: { assignedTo: userIds }
        });

        // Create notifications for new assignees
        if (newAssignees.length > 0) {
            await prisma.notification.createMany({
                data: newAssignees.map(userId => ({
                    userId,
                    title: "New Project Assignment",
                    message: `You have been assigned to project: ${project.name}`,
                    type: "PROJECT_ASSIGNMENT",
                    link: `/projects/${projectId}`
                }))
            });
        }

        return NextResponse.json({ success: true, notifiedCount: newAssignees.length });
    } catch (error: any) {
        console.error("Error updating assignees:", error);
        return NextResponse.json({ error: "Failed to update assignees" }, { status: 500 });
    }
}
