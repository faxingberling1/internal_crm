import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("crm-session");

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = JSON.parse(session.value);
        if (userData.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId, isApproved, employeeNumber, newPassword, shiftStart, shiftEnd } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (isApproved !== undefined) updateData.isApproved = isApproved;

        // Handle Password Reset
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        // Update User
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        // Update Employee Number and Shift Timing if provided
        if (employeeNumber !== undefined || shiftStart !== undefined || shiftEnd !== undefined) {
            const employeeUpdateData: any = {};
            if (employeeNumber !== undefined) employeeUpdateData.employeeNumber = employeeNumber;
            if (shiftStart !== undefined) employeeUpdateData.shiftStart = shiftStart;
            if (shiftEnd !== undefined) employeeUpdateData.shiftEnd = shiftEnd;

            await prisma.employee.update({
                where: { email: user.email },
                data: employeeUpdateData
            });
        }

        return NextResponse.json({
            message: "Member credentials updated successfully",
            user: { id: user.id, isApproved: user.isApproved }
        });
    } catch (error) {
        console.error("Error updating member status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
