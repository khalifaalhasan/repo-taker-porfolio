"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function MobileHero() {
  return (
    <section id="home" className="min-h-[90vh] flex flex-col items-center justify-start pt-8 pb-24 px-4 text-center">
      
      {/* Avatar / Portrait */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative w-36 h-36 rounded-full overflow-hidden border border-border/50 bg-secondary/30 mb-8 mx-auto flex items-center justify-center shadow-2xl"
      >
        <span className="text-muted-foreground text-[10px] font-mono">Portrait</span>
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent pointer-events-none" />
      </motion.div>

      {/* Greeting Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold bg-secondary/80 text-secondary-foreground mb-6 border border-border/50">
          👋 I am Rafi Alfattah
        </span>
      </motion.div>
      
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full"
      >
        <h1 className="text-5xl font-bold tracking-tighter leading-[1.05] mb-4">
          Backend &<br /> 
          <span className="text-muted-foreground">DevOps</span>
        </h1>
      </motion.div>
      
      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-[13px] text-muted-foreground mb-8 leading-relaxed max-w-[280px] mx-auto font-medium"
      >
        Building highly available systems, clean APIs, and automated infrastructure.
      </motion.p>
      
      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col items-center gap-4 w-full max-w-[260px]"
      >
        <Button size="lg" variant="secondary" className="rounded-full w-full font-bold h-12 text-sm shadow-lg shadow-background/50">
          Download CV
        </Button>
        
        <div className="flex items-center justify-center gap-4 text-muted-foreground w-full mt-2">
          <Link href="https://linkedin.com" target="_blank" className="hover:text-foreground transition-all hover:-translate-y-1 p-3.5 rounded-full bg-secondary/30 border border-border/50">
            <Linkedin className="w-5 h-5" />
          </Link>
          <Link href="https://github.com" target="_blank" className="hover:text-foreground transition-all hover:-translate-y-1 p-3.5 rounded-full bg-secondary/30 border border-border/50">
            <Github className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
      
    </section>
  );
}
