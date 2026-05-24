import { ResponsiveNavbar } from "@/components/web/shared/ResponsiveNavbar";
import { ResponsiveHero } from "@/components/web/shared/ResponsiveHero";
import { FeaturedProjects } from "@/components/web/shared/FeaturedProjects";
import { ServicesSection } from "@/components/web/shared/ServicesSection";
import { SkillsSection } from "@/components/web/shared/SkillsSection";
import { AboutSection } from "@/components/web/shared/AboutSection";
import { Footer } from "@/components/web/shared/Footer";
import { fetchGithubProjects, fetchProfileData } from "@/lib/github";

export default async function Home() {
  const allProjects = await fetchGithubProjects();
  const projects = allProjects.filter(p => !p.isHidden);
  const profileData = await fetchProfileData();

  return (
    <>
      <ResponsiveNavbar profileData={profileData} />
      
      <main className="flex min-h-screen flex-col w-full overflow-hidden">
        <ResponsiveHero profileData={profileData} />
        
        <ServicesSection />
        <AboutSection profileData={profileData} />
        <SkillsSection />
        <FeaturedProjects projects={projects} />
      </main>

      <Footer />
    </>
  );
}
