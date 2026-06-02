import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const repo = searchParams.get("repo");
  const file = searchParams.get("file") || "thumbnail.png";
  
  const GITHUB_PAT = process.env.GITHUB_PAT;
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "github";

  if (!repo || !GITHUB_PAT) {
    return new NextResponse("Missing repo or PAT", { status: 400 });
  }

  try {
    // We fetch the raw content from GitHub
    // Using api.github.com to get the default branch automatically, or just hit raw.githubusercontent.com
    // Let's use api.github.com to be branch-agnostic (handles main vs master):
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${file}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github.v3.raw",
      },
      // Cache this image heavily at the edge
      next: { revalidate: 86400 } // 24 hours cache
    });

    if (!response.ok) {
      return new NextResponse("Image not found on GitHub", { status: response.status });
    }

    let contentType = response.headers.get("Content-Type") || "image/png";
    const lowerFile = file.toLowerCase();
    if (contentType.includes("application/vnd") || contentType.includes("text/plain")) {
      if (lowerFile.endsWith(".jpg") || lowerFile.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (lowerFile.endsWith(".png")) contentType = "image/png";
      else if (lowerFile.endsWith(".gif")) contentType = "image/gif";
      else if (lowerFile.endsWith(".svg")) contentType = "image/svg+xml";
      else if (lowerFile.endsWith(".ico")) contentType = "image/x-icon";
      else if (lowerFile.endsWith(".webp")) contentType = "image/webp";
    }
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000",
      },
    });
  } catch (error) {
    console.error("Failed to proxy GitHub image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
