import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-me-in-production-32-chars!!'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const reqMethod = request.method;

  // Protect /admin/* except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('cms_session')?.value;
    if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect write API routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    // Always let CORS preflights through — route handlers return proper headers
    if (reqMethod === 'OPTIONS') return NextResponse.next();

    const isPublicGet =
      reqMethod === 'GET' &&
      (pathname.startsWith('/api/pages') ||
        pathname.startsWith('/api/posts') ||
        pathname.startsWith('/api/products') ||
        pathname.startsWith('/api/media') ||
        pathname.startsWith('/api/settings'));

    if (!isPublicGet) {
      // Bearer token: pass through to route handler for DB verification
      const authHeader = request.headers.get('Authorization') ?? '';
      if (authHeader.startsWith('Bearer cms_')) return NextResponse.next();

      // Cookie session: verify JWT in Edge runtime (jose works here)
      const sessionToken = request.cookies.get('cms_session')?.value;
      if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      try {
        await jwtVerify(sessionToken, JWT_SECRET);
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
