import { fetchGithubProject } from "@/lib/github";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Github, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await fetchGithubProject(slug);
  
  if (!project) return notFound();

  return (
    <main className="min-h-screen bg-background pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
        
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{project.title}</h1>
            
            {/* Conditional Links Row */}
            {(project.githubUrl || project.liveUrl || project.isPrivateRepo) && (
              <div className="flex flex-wrap items-center gap-4">
                {project.githubUrl ? (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-secondary border border-border/50 text-secondary-foreground hover:opacity-80 transition-opacity">
                    <Github className="w-4 h-4" />
                    Source Code
                  </a>
                ) : project.isPrivateRepo ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-secondary/30 border border-border/30 text-muted-foreground cursor-not-allowed" title="Source code is private">
                    <Lock className="w-4 h-4" />
                    Private Repository
                  </span>
                ) : null}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-accent text-accent-foreground hover:opacity-80 transition-opacity">
                    <ExternalLink className="w-4 h-4" />
                    Live Preview
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Image Gallery */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-4 pt-4">
              {/* Featured Image */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-lg">
                <Image 
                  src={project.images[0]} 
                  alt={`${project.title} featured image`} 
                  fill 
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover" 
                />
              </div>
              
              {/* Additional Images Grid */}
              {project.images.length > 1 && (
                <div className={`grid gap-4 ${project.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-2'}`}>
                  {project.images.slice(1).map((img, idx) => (
                    <div key={idx} className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm">
                      <Image 
                        src={img} 
                        alt={`${project.title} screenshot ${idx + 1}`} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border/50 pb-2">Overview</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{project.description}</p>
            </section>
          )}

          {/* Challenge Description */}
          {project.challengeDescription && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border/50 pb-2">The Challenge</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{project.challengeDescription}</p>
            </section>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border/50 pb-2">Key Features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3 bg-card border border-border p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground font-medium leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border/50 pb-2">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map(tech => (
                  <Badge key={tech} variant="secondary" className="px-4 py-2 text-sm font-mono bg-secondary/50 border-border/50">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
