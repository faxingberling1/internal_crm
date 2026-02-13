import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notifyAdmins, notifyUsers } from "@/lib/notifications";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignee = searchParams.get('assignee');

        // Build filter object
        const where: any = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignee) where.assignedTo = { has: assignee };

        const projects = await prisma.project.findMany({
            where,
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, status, priority, color, leadId, assignedTo, startDate, dueDate, tags } = body;

        if (!name) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                status: status || "PLANNING",
                priority: priority || "MEDIUM",
                color,
                leadId,
                assignedTo: assignedTo || [],
                startDate: startDate ? new Date(startDate) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
                tags: tags || [],
                progress: 0
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // 1. Notify Admins about the new project
        await notifyAdmins({
            title: "New Project Launched",
            message: `Project "${project.name}" has been created.`,
            type: "PROJECT_CREATED",
            link: `/projects/${project.id}`
        });

        // 2. Notify Assigned Users if any
        if (assignedTo && assignedTo.length > 0) {
            await notifyUsers(assignedTo, {
                title: "Assigned to New Project",
                message: `You have been assigned to the new project: ${project.name}`,
                type: "PROJECT_ASSIGNMENT",
                link: `/projects/${project.id}`
            });
        }

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
