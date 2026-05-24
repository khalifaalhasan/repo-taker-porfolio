import { fetchGithubProjects } from "@/lib/github";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 12;
  
  const allProjects = await fetchGithubProjects();
  const visibleProjects = allProjects.filter(p => !p.isHidden);
  
  const totalProjects = visibleProjects.length;
  const totalPages = Math.ceil(totalProjects / limit);
  const currentProjects = visibleProjects.slice((page - 1) * limit, page * limit);
  
  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">All Projects</h1>
        <div className="w-20 h-1 bg-accent mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {currentProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="group flex flex-col justify-between rounded-xl md:rounded-2xl bg-card border border-border transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/50 overflow-hidden">
              <div className="flex flex-col h-full">
                {project.images && project.images.length > 0 && (
                  <div className="relative w-full h-40 md:h-56 shrink-0 border-b border-border/50 bg-secondary/30">
                    <Image 
                      src={project.images[0]} 
                      alt={project.title} 
                      fill 
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                )}
                <div className="flex-1 p-4 md:p-6 pb-0">
                  <h3 className="text-xs md:text-xl font-bold mb-2 md:mb-3 group-hover:text-accent transition-colors leading-tight">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-[10px] md:text-sm mb-4 md:mb-6 leading-relaxed line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-mono text-[9px] md:text-xs px-1.5 md:px-2 py-0.5">
                      {tech}
                    </Badge>
                  ))}
                </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 md:pt-4 border-t border-border/50 text-muted-foreground mt-auto mx-4 md:mx-6 mb-4 md:mb-6">
                <span className="text-[10px] md:text-xs font-bold group-hover:text-foreground transition-colors">View Details &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-16 gap-4">
            {page > 1 ? (
              <Link href={`/projects?page=${page - 1}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            ) : (
              <Button variant="outline" disabled>Previous</Button>
            )}
            
            <span className="text-sm font-medium text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            
            {page < totalPages ? (
              <Link href={`/projects?page=${page + 1}`}>
                <Button variant="outline">Next</Button>
              </Link>
            ) : (
              <Button variant="outline" disabled>Next</Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
