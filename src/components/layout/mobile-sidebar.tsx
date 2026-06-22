"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ClipboardList, ShieldAlert,
  Monitor, Settings, X, Fingerprint, LogOut, Bell, Radio, BarChart2
} from "lucide-react";

const navItems = [
  { label: "Dashboard",            href: "/dashboard",            icon: LayoutDashboard },
  { label: "Live Monitoring",      href: "/dashboard/live",       icon: Radio, badge: 0, pulse: true },
  { label: "Analytics",             href: "/dashboard/analytics",  icon: BarChart2 },
  { label: "Attendance Logs",      href: "/dashboard/attendance", icon: ClipboardList },
  { label: "Connected Users",      href: "/dashboard/connected",  icon: Users },
  { label: "Unauthorized Devices", href: "/dashboard/devices",    icon: ShieldAlert, badge: 3 },
  { label: "User Management",      href: "/dashboard/users",      icon: Monitor },
  { label: "Settings",             href: "/dashboard/settings",   icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-[hsl(var(--sidebar))] z-50 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-[hsl(var(--sidebar-border))]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-display font-bold text-base">FutureTrack</span>
              </div>
              <button onClick={onClose} className="text-[hsl(var(--sidebar-foreground))/60] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 h-11 rounded-xl transition-all",
                      isActive
                        ? "bg-primary/20 text-white"
                        : "text-[hsl(var(--sidebar-foreground))/70] hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4.5 h-4.5", isActive && "text-primary")} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 py-4 border-t border-[hsl(var(--sidebar-border))] space-y-1">
              <button className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[hsl(var(--sidebar-foreground))/60] hover:text-white hover:bg-white/8 transition-all">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Notifications</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[hsl(var(--sidebar-foreground))/60] hover:text-red-400 hover:bg-red-950/30 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
