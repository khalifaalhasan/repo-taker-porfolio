import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

import { ProfileData } from "@/lib/github";

export function Footer({ profileData }: { profileData?: ProfileData | null }) {
  const name = profileData?.name || "Porto.social";
  return (
    <footer className="bg-background border-t border-border pt-12 pb-32 md:py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{name}</h2>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Building scalable systems & clean APIs
            </p>
          </div>

          <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/#home" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/#projects" className="hover:text-foreground transition-colors">Projects</Link>
            <Link href="/#experience" className="hover:text-foreground transition-colors">Experience</Link>
            <Link href="/#about" className="hover:text-foreground transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
