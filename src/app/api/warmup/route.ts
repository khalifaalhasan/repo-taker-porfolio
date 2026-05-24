import { NextResponse } from 'next/server';
import { fetchGithubProjects } from '@/lib/github';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Lindungi endpoint dari akses publik
  if (secret !== process.env.WARMUP_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await fetchGithubProjects();
    const results = [];

    // URL dasar aplikasi kita. Di Vercel, VERCEL_URL sudah otomatis ada.
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

    // Proses warmup
    for (const project of projects) {
      if (project.liveUrl && project.images.length > 0) {
        // Cari URL Microlink yang ada di dalam gambar project
        const microlinkUrl = project.images.find(img => img.includes('microlink.io'));
        
        if (microlinkUrl) {
          // Pre-warm Next.js Image Edge Cache
          // Sesuaikan parameter w (width) dengan konfigurasi Next.js (1920)
          const encodedUrl = encodeURIComponent(microlinkUrl);
          const nextImageUrl = `${baseUrl}/_next/image?url=${encodedUrl}&w=1920&q=75`;
          
          try {
            // Tembak GET Request untuk memaksa Next.js mengunduh dan mengoptimasi
            const res = await fetch(nextImageUrl);
            if (res.ok) {
              results.push({ slug: project.slug, status: 'warmed', url: nextImageUrl });
            } else {
              results.push({ slug: project.slug, status: 'failed_status', code: res.status });
            }
          } catch (e) {
            results.push({ slug: project.slug, status: 'failed_fetch', error: String(e) });
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Cache warmup successfully triggered!',
      totalWarmed: results.length,
      details: results
    });

  } catch (error) {
    console.error('[Warmup Endpoint] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
