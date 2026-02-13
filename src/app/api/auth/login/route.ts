import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isInOfficeRange } from "@/lib/security";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        console.log("Login attempt for:", email);

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        console.log("Querying user from prisma...");
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log("User not found");
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log("Checking approval status...");
        if (!user.isApproved) {
            console.log("User not approved");
            return NextResponse.json({ error: "Account pending admin approval" }, { status: 403 });
        }

        console.log("Verifying password...");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Security Check: IP and Time Validation (Non-Admins Only)
        if (user.role !== 'ADMIN') {
            const settings = await prisma.brandingSettings.findFirst();

            if (settings?.isSecurityEnabled) {
                // A. IP ENFORCEMENT (Range: 192.168.18.1-100)
                const forwardedFor = req.headers.get('x-forwarded-for');
                const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

                if (settings.officeIP && !isInOfficeRange(clientIP, settings.officeIP)) {
                    console.log(`[Security] Login blocked for IP: ${clientIP} (not in range 192.168.18.1-100)`);
                    return NextResponse.json({
                        error: "Access restricted to office network only",
                        reason: "ip",
                        details: {
                            yourIP: clientIP,
                            requiredRange: "192.168.18.1-100"
                        }
                    }, { status: 403 });
                }

            }
        }

        // Create a simple session cookie (in a real app, use a proper session/JWT)
        const sessionData = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            isApproved: user.isApproved
        };

        console.log("Setting session cookie...");
        const cookieStore = await cookies();
        cookieStore.set("crm-session", JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        console.log("Login successful");
        return NextResponse.json({
            message: "Login successful",
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error: any) {
        console.error("Login error detail:", error);
        return NextResponse.json({ error: "Failed to login", details: error.message }, { status: 500 });
    }
}
