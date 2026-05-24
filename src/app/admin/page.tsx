import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchGithubProjects } from "@/lib/github";
import { getProjectMetas } from "@/lib/projectMetaStore";
import { Briefcase, EyeOff, Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard(props: { searchParams: Promise<{ installation_id?: string, setup_action?: string, new?: string }> }) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser?.githubInstallationId) {
    redirect("/onboarding");
  }

  const username = dbUser.githubUsername || dbUser.name || "developer";

  // URL untuk melihat portofolio langsung dari dashboard
  const isLocal = process.env.NODE_ENV !== 'production';
  const liveUrl = isLocal ? `http://${username}.localhost:3000` : `https://${username}.porto.social`;

  // Cek apakah user ini adalah SUPER ADMIN (misalnya Anda sendiri)
  const isSuperAdmin = username.toLowerCase() === 'khalifaalhasan' || username.toLowerCase() === 'banggapunyaweb';

  if (!isSuperAdmin) {
    // DASHBOARD UNTUK USER BIASA (SaaS User)
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[80vh]">
        <div className="max-w-2xl w-full text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome back, <span className="text-primary">{username}</span>!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your portfolio is live and automatically syncing with your GitHub repositories.
          </p>
          <a href={liveUrl} target="_blank" rel="noreferrer">
            <Button size="lg" className="gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-2xl shadow-lg shadow-primary/20">
              <ExternalLink className="w-5 h-5" />
              Visit Your Portfolio
            </Button>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
          <div className="p-6 rounded-2xl bg-secondary/20 border border-border">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Github className="w-5 h-5" /> Auto-Sync</h3>
            <p className="text-muted-foreground text-sm">We automatically detect changes in your GitHub repositories and update your portfolio without any manual work.</p>
          </div>
          <div className="p-6 rounded-2xl bg-secondary/20 border border-border">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Edge Speed</h3>
            <p className="text-muted-foreground text-sm">Your portfolio is cached globally at the edge. Recruiters will experience near-instant load times.</p>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD UNTUK SUPER ADMIN (Pengelola Utama)
  const projects = await fetchGithubProjects();
  const metas = await getProjectMetas();
  const hiddenCount = projects.filter(p => metas.some((m: any) => m.slug === p.slug && m.isHidden)).length;
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage global portfolio settings and visibility.</p>
        </div>
        <a href={liveUrl} target="_blank" rel="noreferrer">
          <Button variant="outline" className="gap-2 font-semibold">
            <ExternalLink className="w-4 h-4" />
            View My Live Portfolio
          </Button>
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-border bg-card rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Github className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Github Repos</p>
              <h3 className="text-2xl font-bold">{projects.length}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 border border-border bg-card rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <EyeOff className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hidden Projects</p>
              <h3 className="text-2xl font-bold">{hiddenCount}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 border border-border bg-card rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Briefcase className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visible Projects</p>
              <h3 className="text-2xl font-bold">{projects.length - hiddenCount}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
