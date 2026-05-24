import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");
  const url = searchParams.get("url");

  if (!repo || !url) {
    return NextResponse.json({ error: "Missing repo or url parameter" }, { status: 400 });
  }

  try {
    const fileName = `screenshot-${repo}.png`;
    const bucket = "portfolio";
    const filePath = `projects/${fileName}`;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

    // Check if the image already exists in Supabase Storage by sending a HEAD request
    const headRes = await fetch(publicUrl, { method: "HEAD" });
    if (headRes.ok) {
      // Hit: Image already exists in Supabase, return redirect to it
      return NextResponse.redirect(publicUrl);
    }

    // Miss: Fetch from Microlink
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&waitFor=2500`;
    
    console.log(`[Screenshot Proxy] Fetching from Microlink for ${repo}...`);
    const microlinkRes = await fetch(microlinkUrl);
    
    if (!microlinkRes.ok) {
      throw new Error(`Failed to fetch from Microlink: ${microlinkRes.statusText}`);
    }

    const arrayBuffer = await microlinkRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    console.log(`[Screenshot Proxy] Uploading to Supabase Storage for ${repo}...`);
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Return redirect to the new Supabase URL
    return NextResponse.redirect(publicUrl);

  } catch (error) {
    console.error("[Screenshot Proxy] Error:", error);
    // Fallback: If everything fails, just redirect to a dummy image
    return NextResponse.redirect(`https://picsum.photos/seed/${repo}/800/450`);
  }
}
