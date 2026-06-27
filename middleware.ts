import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || '';

function getSecretKey() {
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    console.error('SESSION_SECRET is not configured or too short');
    return null;
  }
  return new TextEncoder().encode(SESSION_SECRET);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API routes
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const secretKey = getSecretKey();
    if (!secretKey) {
      console.error('Session verification blocked: invalid SESSION_SECRET');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify JWT token
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch (error) {
      console.error('Session verification failed:', error);
      // Clear invalid cookie to prevent redirect loop
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
