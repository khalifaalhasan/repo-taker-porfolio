import { fetchGithubProjects } from "@/lib/github";
import { getProjectMetas } from "@/lib/projectMetaStore";
import { Briefcase, EyeOff, Github } from "lucide-react";

export default async function AdminDashboard() {
  const projects = await fetchGithubProjects();
  const metas = await getProjectMetas();

  // count from the metas
  const hiddenCount = projects.filter(p => metas.some((m: any) => m.slug === p.slug && m.isHidden)).length;
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
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
