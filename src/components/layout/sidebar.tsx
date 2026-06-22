"use client";

import { useState } from "react";
import { useDetectionStats } from "@/stores/detection-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ClipboardList, ShieldAlert,
  Monitor, Settings, ChevronLeft, ChevronRight,
  Fingerprint, LogOut, Bell, Radio, BarChart2
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  pulse?: boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",            href: "/dashboard",            icon: LayoutDashboard },
  { label: "Live Monitoring",      href: "/dashboard/live",       icon: Radio, pulse: true },
  { label: "Analytics",             href: "/dashboard/analytics",  icon: BarChart2 },
  { label: "Attendance Logs",      href: "/dashboard/attendance", icon: ClipboardList },
  { label: "Connected Users",      href: "/dashboard/connected",  icon: Users },
  { label: "Unauthorized Devices", href: "/dashboard/devices",    icon: ShieldAlert },
  { label: "User Management",      href: "/dashboard/users",      icon: Monitor },
  { label: "Settings",             href: "/dashboard/settings",   icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const detectionStats = useDetectionStats();
  const navItems = BASE_NAV_ITEMS.map(item =>
    item.href === "/dashboard/devices"
      ? { ...item, badge: detectionStats.active > 0 ? detectionStats.active : undefined }
      : item
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="relative flex flex-col h-screen bg-[hsl(var(--sidebar))] sidebar-glow shrink-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 shrink-0 border-b border-[hsl(var(--sidebar-border))]",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-glow">
          <Fingerprint className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <span className="text-white font-display font-bold text-base tracking-tight whitespace-nowrap">
                FutureTrack
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl transition-all duration-150",
                collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 h-10",
                isActive
                  ? "bg-primary/20 text-white"
                  : "text-[hsl(var(--sidebar-foreground))/70] hover:bg-white/8 hover:text-[hsl(var(--sidebar-foreground))]"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
              )}
              <div className="relative shrink-0">
                <Icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "text-[hsl(var(--sidebar-foreground))/60] group-hover:text-[hsl(var(--sidebar-foreground))]"
                )} />
                {item.pulse && !collapsed && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                )}
                {item.badge && !collapsed && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between flex-1 overflow-hidden"
                  >
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isActive ? "text-white" : ""
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))] space-y-0.5">
        <button className={cn(
          "group w-full flex items-center rounded-xl h-10 transition-all",
          "text-[hsl(var(--sidebar-foreground))/60] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-white/8",
          collapsed ? "justify-center" : "gap-3 px-3"
        )}>
          <Bell className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Notifications</span>}
        </button>
        <button className={cn(
          "group w-full flex items-center rounded-xl h-10 transition-all",
          "text-[hsl(var(--sidebar-foreground))/60] hover:text-red-400 hover:bg-red-950/30",
          collapsed ? "justify-center" : "gap-3 px-3"
        )}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-card hover:shadow-card-hover transition-all z-30"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
          : <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
      </button>
    </motion.aside>
  );
}
