import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        const isAdmin = userData.role === "ADMIN";

        // Fetch counts for stats
        const [totalLeads, pendingProposals, callsToday, totalRevenue] = await Promise.all([
            prisma.lead.count(),
            prisma.proposal.count({ where: { status: "DRAFT" } }),
            prisma.call.count({
                where: {
                    timestamp: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                },
            }),
            prisma.proposal.aggregate({
                _sum: { value: true },
                where: { status: "ACCEPTED" },
            }),
        ]);

        // Fetch recent leads
        const recentLeads = await prisma.lead.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
        });

        // Fetch upcoming calls (mocked for now based on recent calls or just empty)
        const upcomingCalls = await prisma.call.findMany({
            take: 5,
            include: { lead: true },
            orderBy: { timestamp: "desc" },
        });

        // Fetch employee data if not admin
        let employee = null;
        try {
            if (!isAdmin) {
                employee = await prisma.employee.findFirst({
                    where: { userId: userData.id },
                    include: {
                        attendance: {
                            orderBy: { checkIn: "desc" },
                            take: 1
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Employee fetching error:", e);
        }

        return NextResponse.json({
            stats: [
                { name: "Total Leads", value: totalLeads.toString(), change: "+2.5%", icon: "Users", color: "text-blue-600", bg: "bg-blue-100", glow: "card-blue" },
                { name: "Pending Proposals", value: pendingProposals.toString(), change: "+1.2%", icon: "FileText", color: "text-purple-600", bg: "bg-purple-100", glow: "card-purple" },
                { name: "Calls Today", value: callsToday.toString(), change: "+0.5%", icon: "PhoneCall", color: "text-green-600", bg: "bg-green-100", glow: "card-green" },
                { name: "Revenue (Actual)", value: `$${(totalRevenue._sum.value || 0).toLocaleString()}`, change: "+15.3%", icon: "TrendingUp", color: "text-orange-600", bg: "bg-orange-100", glow: "card-blue" },
            ],
            recentLeads,
            upcomingCalls,
            user: {
                ...userData,
                employee
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
