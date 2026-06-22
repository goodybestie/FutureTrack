"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { WifiEngineProvider } from "@/components/providers/wifi-engine-provider";
import { useUIStore } from "@/stores/ui-store";

/**
 * Persistent shell for everything under /dashboard.
 *
 * This is the key fix for slow sidebar navigation: Next.js keeps this
 * layout mounted across client-side route changes within the segment,
 * so the Sidebar, MobileSidebar, and WifiEngineProvider (and the
 * background simulator it boots) are created ONCE and reused — instead
 * of being torn down and rebuilt on every click, which is what was
 * causing the multi-second delay.
 */
export default function DashboardSegmentLayout({ children }: { children: React.ReactNode }) {
  const mobileNavOpen = useUIStore(s => s.mobileNavOpen);
  const closeMobileNav = useUIStore(s => s.closeMobileNav);

  // Theme is read once at the shell level so it doesn't flicker on nav
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  return (
    <WifiEngineProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <MobileSidebar open={mobileNavOpen} onClose={closeMobileNav} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </WifiEngineProvider>
  );
}
