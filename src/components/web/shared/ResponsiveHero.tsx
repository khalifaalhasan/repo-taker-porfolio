"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopHero } from "@/components/web/desktop/DesktopHero";
import { MobileHero } from "@/components/web/mobile/MobileHero";
import { useEffect, useState } from "react";

export function ResponsiveHero() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen w-full" />;

  return isMobile ? <MobileHero /> : <DesktopHero />;
}
