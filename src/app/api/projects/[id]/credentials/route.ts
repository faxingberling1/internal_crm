import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";

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

        const { id: projectId } = await params;

        const credentials = await prisma.credential.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });

        // Decrypt values before sending to client
        const decryptedCredentials = credentials.map(cred => ({
            ...cred,
            value: decrypt(cred.value)
        }));

        return NextResponse.json(decryptedCredentials);
    } catch (error: any) {
        console.error("Error fetching credentials:", error);
        return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
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
        const body = await req.json();

        const { name, type, username, value, url, notes } = body;

        if (!name || !type || !value) {
            return NextResponse.json({ error: "Name, type, and value are required" }, { status: 400 });
        }

        const credential = await prisma.credential.create({
            data: {
                name,
                type,
                username,
                value: encrypt(value),
                url,
                notes,
                projectId,
                createdBy: userData.id
            }
        });

        return NextResponse.json({
            ...credential,
            value: value // Send back unencrypted for immediate feedback
        }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating credential:", error);
        return NextResponse.json({ error: "Failed to create credential" }, { status: 500 });
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

        const userData = JSON.parse(session.value);

        // ONLY ADMINS can delete credentials
        if (userData.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const credentialId = searchParams.get("credentialId");

        if (!credentialId) {
            return NextResponse.json({ error: "Credential ID is required" }, { status: 400 });
        }

        await prisma.credential.delete({
            where: { id: credentialId }
        });

        return NextResponse.json({ success: true, message: "Credential deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting credential:", error);
        return NextResponse.json({ error: "Failed to delete credential" }, { status: 500 });
    }
}
