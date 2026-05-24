import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || ''; 
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // Remove port for localhost testing
  const cleanHostname = hostname.split(':')[0]; 
  console.log(`[Middleware] Hostname: ${hostname}, Clean: ${cleanHostname}, Path: ${path}`);

  // Logika 1: Landing Page / Main Application
  // Jika ini adalah domain utama (termasuk akses via localhost/IP tanpa subdomain)
  if (
    cleanHostname === 'localhost' ||
    cleanHostname === 'porto.social' ||
    cleanHostname === 'www.porto.social' ||
    !cleanHostname.includes('.') || // e.g. 'localhost' or '127.0.0.1' or bare IP
    /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname) // e.g. '192.168.1.17'
  ) {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/home', req.url));
    }
    return NextResponse.next();
  }

  // Logika 2: Subdomain (e.g. khalifaalhasan.porto.social atau khalifaalhasan.localhost)
  if (cleanHostname.endsWith('.porto.social')) {
    const username = cleanHostname.replace('.porto.social', '');
    const rewritePath = path === '/' ? `/${username}` : `/${username}${path}`;
    return NextResponse.rewrite(new URL(rewritePath, req.url));
  } else if (cleanHostname.endsWith('.localhost')) {
    const username = cleanHostname.replace('.localhost', '');
    const rewritePath = path === '/' ? `/${username}` : `/${username}${path}`;
    return NextResponse.rewrite(new URL(rewritePath, req.url));
  }

  // Logika 3: Custom Domain
  // Karena middleware berjalan di Edge Runtime, kita tidak bisa memanggil Prisma langsung.
  // Kita harus memanggil internal API Route untuk mengecek status domain.
  try {
    const res = await fetch(new URL(`/api/domain?hostname=${cleanHostname}`, req.url));
    if (res.ok) {
      const data = await res.json();
      if (data.username) {
        return NextResponse.rewrite(new URL(`/${data.username}${path}`, req.url));
      }
    }
  } catch (error) {
    console.error('[Middleware] Custom domain lookup failed:', error);
  }

  // Fallback
  return NextResponse.next();
}
