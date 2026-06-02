import { ResponsiveNavbar } from "@/components/web/shared/ResponsiveNavbar";
import { ResponsiveHero } from "@/components/web/shared/ResponsiveHero";
import { FeaturedProjects } from "@/components/web/shared/FeaturedProjects";
import { ServicesSection } from "@/components/web/shared/ServicesSection";
import { SkillsSection } from "@/components/web/shared/SkillsSection";
import { AboutSection } from "@/components/web/shared/AboutSection";
import { Footer } from "@/components/web/shared/Footer";
import { fetchGithubProjects, fetchProfileData } from "@/lib/github";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "github";
  const profileData = await fetchProfileData(username);

  if (!profileData) {
    return { title: `${username} | Portfolio` };
  }

  return {
    title: `${username} | ${profileData.headline}`,
    description: profileData.bio || `Portfolio of ${username}`,
  };
}

export default async function PortfolioPage() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "github";
  const allProjects = await fetchGithubProjects(username);
  const projects = allProjects.filter((p) => !p.isHidden);
  const profileData = await fetchProfileData(username);

  if (!process.env.GITHUB_PAT || !profileData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8 bg-background text-foreground text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none" />
        
        <div className="max-w-2xl w-full bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Repofolio</span> 🚀</h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-lg mx-auto">
            Your zero-database portfolio is running! We just need access to fetch your beautiful GitHub profile and projects.
          </p>
          
          <div className="text-left bg-secondary/30 rounded-2xl p-6 md:p-8 border border-border/50 mb-8 shadow-sm">
            <h2 className="font-bold text-xl md:text-2xl mb-6 flex items-center gap-3">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md">1</span> 
              Action Required
            </h2>
            <ol className="space-y-4 text-muted-foreground ml-2 md:ml-4 text-base md:text-lg">
              <li className="flex gap-3 items-start">
                <span className="font-mono text-primary mt-0.5">01.</span>
                <span>Open the <code className="bg-background/80 px-2 py-1 rounded-md text-foreground border border-border text-sm shadow-sm">.env</code> file in your project.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-mono text-primary mt-0.5">02.</span>
                <span>Fill in the <code className="bg-background/80 px-2 py-1 rounded-md text-foreground border border-border text-sm shadow-sm">GITHUB_PAT</code> variable with your Personal Access Token.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-mono text-primary mt-0.5">03.</span>
                <span>Refresh this page to see the magic happen! ✨</span>
              </li>
            </ol>
          </div>
          
          <p className="text-sm md:text-base text-muted-foreground bg-background/50 py-3 px-6 rounded-full inline-block border border-border/30">
            Need a token? <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline hover:text-accent transition-colors">Generate one here</a> 
            <span className="opacity-75"> (select 'repo' and 'read:user' scopes)</span>
          </p>
        </div>
      </main>
    );
  }

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

      <Footer profileData={profileData} />
    </>
  );
}
