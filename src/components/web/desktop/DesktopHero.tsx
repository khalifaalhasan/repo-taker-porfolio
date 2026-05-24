"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function DesktopHero() {
  return (
    <section id="home" className="min-h-screen flex items-center pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start max-w-2xl"
        >
          <span className="text-muted-foreground font-medium mb-4 tracking-wide">
            I am Rafi Alfattah
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
            Backend & DevOps <br />
            <span className="text-muted-foreground">Engineer</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
            Building highly available systems, clean APIs, and automated infrastructure to create scalable applications that perform flawlessly.
          </p>
          
          <div className="flex flex-col gap-6">
            <Button size="lg" variant="secondary" className="rounded-full w-fit px-8 font-medium">
              Download CV
            </Button>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="https://linkedin.com" target="_blank" className="hover:text-foreground transition-colors p-2 rounded-full bg-secondary/50">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="https://github.com" target="_blank" className="hover:text-foreground transition-colors p-2 rounded-full bg-secondary/50">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[500px] w-full flex justify-end"
        >
          {/* Avatar / Portrait Image Mock */}
          <div className="relative w-full max-w-md h-full rounded-2xl overflow-hidden bg-secondary/20 border border-border/50 flex items-center justify-center">
             {/* Replace this with an actual <Image src="..." /> */}
             <span className="text-muted-foreground text-sm font-mono rotate-[-90deg]">Portrait Placeholder</span>
             
             {/* Decorative glow matching theme */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
