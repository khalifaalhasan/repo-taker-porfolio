"use client";

import { Button } from "@/components/ui/button";
import { Github, Rocket } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { ThemeToggle } from "@/components/web/shared/ThemeToggle";

export function LandingNavbar() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/admin"
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
            P
          </div>
          <span className="font-bold text-lg hidden sm:block">Porto.social</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={handleLogin} disabled={isLoading} size="sm" className="gap-2 font-semibold shadow-md">
            {isLoading ? <Rocket className="animate-spin w-4 h-4" /> : <Github className="w-4 h-4" />}
            <span className="hidden sm:inline">{isLoading ? "Connecting..." : "Login"}</span>
            <span className="sm:hidden">{isLoading ? "..." : "Login"}</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
