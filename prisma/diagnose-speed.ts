import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking database counts...");
    const [leads, proposals, calls, employees, attendance] = await Promise.all([
        prisma.lead.count(),
        prisma.proposal.count(),
        prisma.call.count(),
        prisma.employee.count(),
        prisma.attendance.count()
    ]);

    console.log({
        leads,
        proposals,
        calls,
        employees,
        attendance
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
