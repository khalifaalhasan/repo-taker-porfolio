import { LandingHero } from "@/components/web/landing/LandingHero";
import { LandingNavbar } from "@/components/web/landing/LandingNavbar";
import { LandingFeatures } from "@/components/web/landing/LandingFeatures";
import { Footer } from "@/components/web/shared/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Porto.social - Zero-DB Developer Portfolios",
  description: "Generate a stunning, edge-cached portfolio instantly from your GitHub profile. No database required. Fully automated.",
};

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main className="w-full min-h-screen bg-background text-foreground">
        <LandingHero />
        <LandingFeatures />
      </main>
      <Footer />
    </>
  );
}
