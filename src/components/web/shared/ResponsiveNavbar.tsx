"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopNavbar } from "@/components/web/desktop/DesktopNavbar";
import { MobileNavbar } from "@/components/web/mobile/MobileNavbar";
import { useEffect, useState } from "react";

export function ResponsiveNavbar() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch: render nothing (or a skeleton) until mounted
  if (!mounted) return <div className="h-16 w-full fixed top-0 z-50" />;

  return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
}
