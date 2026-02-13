import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to check if IP is in office range (192.168.18.1-100)
function isInOfficeRange(ip: string): boolean {
    // Allow both IPv4 and IPv6 localhost
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') return true;

    // Check if IP matches pattern 192.168.18.X where X is 1-100
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) return false;

    const [oct1, oct2, oct3, oct4] = ipParts.map(Number);

    // Check if it's in the 192.168.18.x subnet
    if (oct1 === 192 && oct2 === 168 && oct3 === 18) {
        // Check if last octet is between 1 and 100
        return oct4 >= 1 && oct4 <= 100;
    }

    return false;
}

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
            // A. IP ENFORCEMENT (Range: 192.168.18.1-100)
            const forwardedFor = request.headers.get('x-forwarded-for');
            const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

            if (settings.officeIP && !isInOfficeRange(clientIP)) {
                console.log(`[Security] Blocked access for IP: ${clientIP} (not in range 192.168.18.1-100)`);
                return NextResponse.redirect(new URL('/unauthorized?reason=ip', request.url));
            }

            // B. TIME ENFORCEMENT (Karachi Time / UTC+5)
            if (settings.officeHoursStart && settings.officeHoursEnd) {
                const now = new Date();
                // Karachi is UTC+5
                const karachiTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
                const currentHour = karachiTime.getUTCHours();
                const currentMin = karachiTime.getUTCMinutes();
                const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

                if (currentTimeStr < settings.officeHoursStart || currentTimeStr > settings.officeHoursEnd) {
                    console.log(`[Security] Blocked access outside hours: ${currentTimeStr}`);
                    return NextResponse.redirect(new URL('/unauthorized?reason=time', request.url));
                }
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
