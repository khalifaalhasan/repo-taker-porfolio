import { LandingHero } from "@/components/web/landing/LandingHero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Porto.social - Zero-DB Developer Portfolios",
  description: "Generate a stunning, edge-cached portfolio instantly from your GitHub profile. No database required. Fully automated.",
};

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground">
      <LandingHero />
    </main>
  );
}
