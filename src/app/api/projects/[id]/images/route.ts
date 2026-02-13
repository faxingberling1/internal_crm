import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

        const { id } = await params;
        const { image } = await req.json(); // Expected to be base64 for now

        if (!image) {
            return NextResponse.json({ error: "Image data is required" }, { status: 400 });
        }

        const project = await prisma.project.update({
            where: { id },
            data: {
                images: {
                    push: image
                }
            }
        });

        return NextResponse.json(project.images);
    } catch (error: any) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
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
        const { imageUrl } = await req.json();

        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const updatedImages = project.images.filter(img => img !== imageUrl);

        await prisma.project.update({
            where: { id },
            data: {
                images: updatedImages
            }
        });

        return NextResponse.json(updatedImages);
    } catch (error: any) {
        console.error("Error deleting image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}
