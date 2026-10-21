import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'super-secret-classup-key-2025',
  });

  const { pathname } = request.nextUrl;

  // Protect admin dashboard
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/catalog', request.url));
    }
  }

  // Protect saved scripts & profile pages
  if (pathname.startsWith('/saved') || pathname.startsWith('/profile')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/saved/:path*', '/profile/:path*'],
};
