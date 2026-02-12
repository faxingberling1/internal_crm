import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const session = request.cookies.get('crm-session');
    const { pathname } = request.nextUrl;

    // Allow static files and auth-related routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/api/seed/admin'
    ) {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const userData = JSON.parse(session.value);

        // Block unapproved users
        if (!userData.isApproved && pathname !== '/login') {
            return NextResponse.redirect(new URL('/login?error=pending', request.url));
        }

        // Admin-only route protection
        if (pathname.startsWith('/admin') && userData.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch (e) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)'],
};
