import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getInstallationDetails } from "@/lib/github/auth";
import { DashboardTerminal } from "@/components/web/admin/DashboardTerminal";

export default async function OnboardingPage(props: { searchParams: Promise<{ installation_id?: string, setup_action?: string }> }) {
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
      redirect("/onboarding");
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

  // Check if domain exists, if not create it
  const headersList = await headers();
  const host = headersList.get("host") || "porto.social";
  const cleanHost = host.split(":")[0];
  const domainHost = `${username}.${cleanHost}`;
  const existingDomain = await prisma.domain.findUnique({
    where: { hostname: domainHost }
  });

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

  // Tampilkan animasi terminal provisioning!
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-background text-foreground">
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
