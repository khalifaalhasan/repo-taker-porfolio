import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get("hostname");

  if (!hostname) {
    return NextResponse.json({ error: "Missing hostname parameter" }, { status: 400 });
  }

  try {
    const domain = await prisma.domain.findUnique({
      where: { hostname },
      include: { user: true }
    });

    if (domain && domain.isActive && domain.user) {
      // Prioritize githubUsername since the app uses GitHub data, fallback to regular name
      const username = domain.user.githubUsername || domain.user.name;
      return NextResponse.json({ username });
    }

    return NextResponse.json({ error: "Domain not found or inactive" }, { status: 404 });
  } catch (error) {
    console.error("[Domain API] Lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
