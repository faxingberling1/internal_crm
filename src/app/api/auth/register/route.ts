import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        if (!email.endsWith("@nbt.com")) {
            return NextResponse.json({ error: "Registration is restricted to @nbt.com emails" }, { status: 403 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Use a transaction to ensure both user and employee are created
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: "USER",
                    isApproved: false,
                },
            });

            const employee = await tx.employee.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    user: { connect: { id: user.id } },
                },
            });

            return { user, employee };
        });

        return NextResponse.json({
            message: "Account created and pending approval",
            user: { id: result.user.id, email: result.user.email, name: result.user.name }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}
