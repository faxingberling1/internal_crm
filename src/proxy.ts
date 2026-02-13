import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isInOfficeRange } from '@/lib/security';

export default async function middleware(request: NextRequest) {
    const session = request.cookies.get('crm-session');
    const { pathname } = request.nextUrl;

    // Allow static files and auth-related routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/unauthorized' ||
        pathname === '/api/seed/admin' ||
        pathname === '/api/settings/branding' // Need this to fetch settings in middleware
    ) {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const userData = JSON.parse(session.value);

        // 1. ADMIN BYPASS & PUBLIC ROUTES
        if (userData.role === 'ADMIN') {
            return NextResponse.next();
        }

        // 2. FETCH SECURITY SETTINGS
        const origin = request.nextUrl.origin;
        // In some environments, internal fetch might fail, so we wrap it
        let settings = null;
        try {
            const settingsRes = await fetch(`${origin}/api/settings/branding`);
            if (settingsRes.ok) {
                settings = await settingsRes.json();
            }
        } catch (e) {
            console.error('[Security] Failed to fetch settings:', e);
        }

        if (settings?.isSecurityEnabled) {
            // A. IP ENFORCEMENT
            // Use request.ip for Vercel, fallback to x-forwarded-for for local
            const forwardedFor = request.headers.get('x-forwarded-for');
            const clientIP = (request as any).ip || (forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1');

            if (settings.officeIP && !isInOfficeRange(clientIP, settings.officeIP)) {
                console.log(`[Security] Blocked access for IP: ${clientIP} (Authorized: ${settings.officeIP} or 192.168.18.x)`);
                return NextResponse.redirect(new URL('/unauthorized?reason=ip', request.url));
            }
        }

        return NextResponse.next();
    } catch (e) {
        console.error('Middleware Error:', e);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)'],
};
