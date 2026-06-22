"use client";

import { useState, useEffect } from "react";
import { Topbar } from "./topbar";
import { useUIStore } from "@/stores/ui-store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Per-page wrapper — renders the Topbar (with page title/subtitle) and
 * the scrollable content area.
 *
 * NOTE: Sidebar, MobileSidebar, and the WiFi engine now live in
 * `src/app/dashboard/layout.tsx` (the Next.js route-segment layout),
 * not here. That's what keeps them mounted across page navigation
 * instead of rebuilding on every sidebar click. The mobile-nav open
 * state is shared via `useUIStore` so the Topbar's hamburger button
 * can reach the Sidebar that now lives one layout level up.
 */
export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const openMobileNav = useUIStore(s => s.openMobileNav);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <>
      <Topbar
        title={title}
        subtitle={subtitle}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onMenuToggle={openMobileNav}
      />
      <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
        {children}
      </main>
    </>
  );
}
