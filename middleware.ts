import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Best Practice: Gunakan url.search langsung alih-alih membuat ulang string
  const path = `${url.pathname}${url.search}`;

  // Hapus port untuk mempermudah pengecekan (hanya mendapatkan base host-nya saja)
  const cleanHostname = hostname.split(":")[0];



  // 1. Logika Landing Page / Main Application
  const isMainDomain =
    cleanHostname === "localhost" ||
    cleanHostname === "porto.social" ||
    cleanHostname === "www.porto.social" ||
    cleanHostname === "staging.porto.social" ||
    cleanHostname === "testing.porto.social" ||
    !cleanHostname.includes(".") || // localhost, bare IP
    /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname);

  let baseDomain = "";
  if (cleanHostname.endsWith(".testing.porto.social")) {
    baseDomain = ".testing.porto.social";
  } else if (cleanHostname.endsWith(".staging.porto.social")) {
    baseDomain = ".staging.porto.social";
  } else if (cleanHostname.endsWith(".porto.social")) {
    baseDomain = ".porto.social";
  } else if (cleanHostname.endsWith(".localhost")) {
    baseDomain = ".localhost";
  }

  const isSubdomain = baseDomain !== "" && !isMainDomain;

  if (isMainDomain) {
    return NextResponse.next();
  }

  // 2. Logika Subdomain
  if (isSubdomain) {
    const username = cleanHostname.replace(baseDomain, "");

    // Pastikan tidak merender root jika username kosong (hanya berjaga-jaga)
    if (username) {
      return NextResponse.rewrite(new URL(`/${username}${path}`, req.url));
    }
  }

  // 3. Logika Custom Domain
  try {
    const res = await fetch(
      new URL(`/api/domain?hostname=${cleanHostname}`, req.url),
    );

    if (res.ok) {
      const data = await res.json();
      if (data?.username) {
        return NextResponse.rewrite(
          new URL(`/${data.username}${path}`, req.url),
        );
      }
    }
  } catch (error) {
    // Memberikan prefix spesifik agar mudah ditelusuri di log server
    console.error(
      `[Middleware: Custom Domain Error] for ${cleanHostname}:`,
      error,
    );
  }

  // Fallback
  return NextResponse.next();
}
