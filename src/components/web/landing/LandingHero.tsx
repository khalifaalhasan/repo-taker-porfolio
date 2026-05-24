"use client";

import { Button } from "@/components/ui/button";
import { Github, Rocket, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function LandingHero() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/admin" // Redirect to admin dashboard after login
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate px-6 lg:px-8 bg-background min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-muted-foreground ring-1 ring-border/50 hover:ring-border transition-all">
            Welcome to Porto.social ✨ The future of portfolios.
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Zero-DB Developer Portfolios
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
            Generate a stunning, edge-cached portfolio instantly from your GitHub profile. No database required. Fully automated.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Button size="lg" onClick={handleLogin} disabled={isLoading} className="gap-2 font-semibold shadow-lg hover:shadow-primary/25 transition-all">
              {isLoading ? <Rocket className="animate-spin w-5 h-5" /> : <Github className="w-5 h-5" />}
              {isLoading ? "Connecting..." : "Continue with GitHub"}
            </Button>
            <a href="#features" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors flex items-center gap-1 group">
              Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
