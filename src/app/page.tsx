import { ResponsiveNavbar } from "@/components/web/shared/ResponsiveNavbar";
import { ResponsiveHero } from "@/components/web/shared/ResponsiveHero";
import { FeaturedProjects } from "@/components/web/shared/FeaturedProjects";
import { ServicesSection } from "@/components/web/shared/ServicesSection";
import { SkillsSection } from "@/components/web/shared/SkillsSection";
import { AboutSection } from "@/components/web/shared/AboutSection";
import { Footer } from "@/components/web/shared/Footer";

export default function Home() {
  return (
    <>
      <ResponsiveNavbar />
      
      <main className="flex min-h-screen flex-col w-full overflow-hidden">
        <ResponsiveHero />
        
        <ServicesSection />
        <AboutSection />
        <SkillsSection />
        <FeaturedProjects />
      </main>

      <Footer />
    </>
  );
}
