"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/web/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "Services", href: "/#services" },
  { name: "About", href: "/#about" },
  { name: "Skills", href: "/#skills" },
  { name: "Projects", href: "/#projects" },
];

export function DesktopNavbar() {
  const [activeHash, setActiveHash] = useState("/#home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.substring(2));
      
      let current = sections[0];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = section;
          }
        }
      }
      
      if (current) {
        setActiveHash(`/#${current}`);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // init
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 pt-6 pb-4 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg font-sans transition-transform group-hover:scale-105 border border-border shadow-sm">
            ra
          </div>
        </Link>

        {/* Centered Pill Nav */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <nav className="hidden md:flex items-center p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm">
            {navLinks.map((link) => {
              const isActive = activeHash === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setActiveHash(link.href)}
                  className={`relative px-5 py-2 text-sm font-medium transition-colors rounded-full ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-underline"
                      className="absolute left-0 right-0 bottom-1 mx-auto w-8 h-[2px] rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="secondary" className="rounded-full font-medium px-6 shadow-sm hidden sm:inline-flex">
            Let&apos;s Talk
          </Button>
        </div>
      </div>
    </header>
  );
}
