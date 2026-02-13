import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const lead = await prisma.lead.create({
            data: {
                name: json.name,
                email: json.email,
                phone: json.phone,
                status: json.status || "NEW",
                source: json.source,
                notes: json.notes,
            },
        });

        // Notify admins about the new lead
        await notifyAdmins({
            title: "New Lead Created",
            message: `A new lead has been added: ${lead.name} from ${lead.source || 'Direct'}`,
            type: "LEAD_CREATED",
            link: "/leads" // Assuming there's a leads page
        });

        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }
}
