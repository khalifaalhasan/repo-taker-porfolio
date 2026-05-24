import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getInstallationDetails } from "@/lib/github/auth";
import { DashboardTerminal } from "@/components/web/admin/DashboardTerminal";
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

  const params = await props.searchParams;

  // Fase 3: Handle GitHub App Installation Callback
  if (params.installation_id) {
    try {
      const details = await getInstallationDetails(params.installation_id);
      const githubUsername = details?.account?.login;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          githubInstallationId: params.installation_id,
          githubUsername: githubUsername || session.user.name
        }
      });
      
      // Redirect to clear query params and trigger provisioning animation
      redirect("/admin?new=true");
    } catch (e) {
      console.error("Failed to handle installation callback", e);
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser?.githubInstallationId) {
    const appInstallUrl = process.env.GITHUB_APP_INSTALL_URL || "https://github.com/apps/porto-zero-db/installations/new";
    redirect(appInstallUrl);
  }

  const username = dbUser.githubUsername || dbUser.name || "developer";
  const domainHost = `${username}.porto.social`;
  
  const existingDomain = await prisma.domain.findUnique({
    where: { hostname: domainHost }
  });
  
  const isNew = params.new === 'true' || !existingDomain;

  if (!existingDomain) {
    await prisma.domain.create({
      data: {
        hostname: domainHost,
        isCustom: false,
        isActive: true,
        userId: dbUser.id
      }
    });
  }

  // Jika user baru, tampilkan animasi terminal provisioning!
  if (isNew) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[80vh]">
        <div className="max-w-2xl w-full text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-2">
            Welcome aboard, <span className="text-primary">{username}</span>!
          </h1>
          <p className="text-muted-foreground text-lg animate-in fade-in slide-in-from-bottom-3 delay-150">
            Your portfolio is being generated and deployed to the Edge.
          </p>
        </div>
        <DashboardTerminal username={username} />
      </div>
    );
  }

  // Dashboard Normal untuk user lama
  const projects = await fetchGithubProjects();
  const metas = await getProjectMetas();
  const hiddenCount = projects.filter(p => metas.some((m: any) => m.slug === p.slug && m.isHidden)).length;
  
  // URL untuk melihat portofolio langsung dari dashboard
  const isLocal = process.env.NODE_ENV !== 'production';
  const liveUrl = isLocal ? `http://${username}.localhost:3000` : `https://${username}.porto.social`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <a href={liveUrl} target="_blank" rel="noreferrer">
          <Button variant="outline" className="gap-2 font-semibold">
            <ExternalLink className="w-4 h-4" />
            View Live Portfolio
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
