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

  // Logika 1: Landing Page / Main Application
  if (
    cleanHostname === 'localhost' ||
    cleanHostname === 'porto.social' ||
    cleanHostname === 'www.porto.social'
  ) {
    return NextResponse.next();
  }

  // Logika 2: Subdomain (e.g. khalifaalhasan.porto.social atau khalifaalhasan.localhost)
  if (cleanHostname.endsWith('.porto.social')) {
    const username = cleanHostname.replace('.porto.social', '');
    return NextResponse.rewrite(new URL(`/${username}${path}`, req.url));
  } else if (cleanHostname.endsWith('.localhost')) {
    const username = cleanHostname.replace('.localhost', '');
    return NextResponse.rewrite(new URL(`/${username}${path}`, req.url));
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
