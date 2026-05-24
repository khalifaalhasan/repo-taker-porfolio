import { ResponsiveNavbar } from "@/components/web/shared/ResponsiveNavbar";
import { ResponsiveHero } from "@/components/web/shared/ResponsiveHero";
import { FeaturedProjects } from "@/components/web/shared/FeaturedProjects";
import { ServicesSection } from "@/components/web/shared/ServicesSection";
import { SkillsSection } from "@/components/web/shared/SkillsSection";
import { AboutSection } from "@/components/web/shared/AboutSection";
import { Footer } from "@/components/web/shared/Footer";
import { fetchGithubProjects, fetchProfileData } from "@/lib/github";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { domain: string } }): Promise<Metadata> {
  const username = params.domain;
  const profileData = await fetchProfileData(username);
  
  if (!profileData) {
    return { title: `${username} | Porto.social` };
  }

  return {
    title: `${username} | ${profileData.headline}`,
    description: profileData.bio || `Portfolio of ${username}`,
  };
}

export default async function Home({ params }: { params: { domain: string } }) {
  const username = params.domain;
  const allProjects = await fetchGithubProjects(username);
  const projects = allProjects.filter(p => !p.isHidden);
  const profileData = await fetchProfileData(username);

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
