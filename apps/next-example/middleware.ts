import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ISSUER = 'http://localhost:3001';
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/jwks.json`));

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const isProtected = url.pathname.startsWith('/dashboard');
  if (!isProtected) return NextResponse.next();

  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)app_access=([^;]+)/);
  const token = m?.[1];
  if (!token) return NextResponse.redirect(new URL('/login', url.origin));

  try {
    await jwtVerify(token, JWKS, { issuer: ISSUER });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', url.origin));
  }
}

export const config = { matcher: ['/dashboard/:path*'] };
