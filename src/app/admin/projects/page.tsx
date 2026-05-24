import { fetchGithubProjects } from "@/lib/github";
import { getProjectMetas } from "@/lib/projectMetaStore";
import { AdminProjectList } from "./AdminProjectList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminProjectsPage() {
  const projects = await fetchGithubProjects();
  const metas = await getProjectMetas();

  const projectMetas = projects.map(p => {
    const meta = metas.find((m: any) => m.slug === p.slug);
    return {
      ...p,
      isHidden: meta?.isHidden || false,
      customImages: meta?.images || []
    };
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Projects</h1>
      <AdminProjectList projects={projectMetas} />
    </div>
  );
}
