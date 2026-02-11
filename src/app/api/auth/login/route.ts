import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (!user.isApproved) {
            return NextResponse.json({ error: "Account pending admin approval" }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Create a simple session cookie (in a real app, use a proper session/JWT)
        const sessionData = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            isApproved: user.isApproved
        };

        const cookieStore = await cookies();
        cookieStore.set("crm-session", JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        return NextResponse.json({
            message: "Login successful",
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    }
}
