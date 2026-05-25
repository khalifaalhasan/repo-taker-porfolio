"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  "Authenticating GitHub account...",
  "Provisioning subdomain {username}.{domain}...",
  "Fetching repository metadata...",
  "Optimizing device mockups...",
  "✨ Portfolio deployed successfully!"
];

export function DashboardTerminal({ username }: { username: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Jalankan animasi terminal perlahan (1.5 detik per langkah)
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500); 
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
      // 🔥 The Pre-Warm Hack: Panggil warmup API di belakang layar!
      fetch(`/api/warmup?secret=super-secret-warmup-key-2026`).catch(console.error);
    }
  }, [currentStep]);

  // URL pintar yang berfungsi di Localhost maupun Production (termasuk staging/testing)
  const host = typeof window !== 'undefined' ? window.location.host : 'porto.social';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const liveUrl = `${protocol}//${username}.${host}`;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl bg-[#0d1117] border border-border shadow-2xl overflow-hidden mt-8">
      {/* Mac window header */}
      <div className="h-10 bg-[#161b22] border-b border-border flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">bash - porto-deploy</span>
      </div>
      
      <div className="p-6 font-mono text-sm md:text-base leading-relaxed min-h-[300px] flex flex-col justify-between">
        <div className="space-y-4">
          {steps.slice(0, currentStep + 1).map((stepText, idx) => {
            const isLast = idx === currentStep && !isFinished;
            const parsedText = stepText
              .replace("{username}", username)
              .replace("{domain}", typeof window !== 'undefined' ? window.location.host : 'porto.social');
            
            return (
              <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                {idx === steps.length - 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <span className="text-primary shrink-0">➜</span>
                )}
                <span className={`${idx === steps.length - 1 ? "text-green-400 font-bold" : "text-gray-300"}`}>
                  {parsedText}
                </span>
                {isLast && (
                  <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1 align-middle" />
                )}
              </div>
            );
          })}
        </div>
        
        {isFinished && (
          <div className="mt-8 pt-6 border-t border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <a href={liveUrl} target="_blank" rel="noreferrer" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-sans font-semibold py-6 text-lg group shadow-lg shadow-green-900/20">
                View Live Portfolio 
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
