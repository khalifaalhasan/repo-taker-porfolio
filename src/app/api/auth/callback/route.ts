import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  // Jika ini adalah callback dari instalasi GitHub App
  if (installationId && setupAction === 'install') {
    // Kita belokkan (redirect) kembali ke onboarding agar diproses di sana
    return NextResponse.redirect(`${origin}/onboarding?installation_id=${installationId}`);
  }

  // Fallback jika ada akses nyasar
  return NextResponse.redirect(`${origin}/`);
}
