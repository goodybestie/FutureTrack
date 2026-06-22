"use client";

import { Search, Sun, Moon, Menu, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/providers/auth-provider";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}


export function Topbar({ title, subtitle, onMenuToggle, isDark, onThemeToggle }: TopbarProps) {
  const { profile, signOut } = useAuthContext();
  
  const displayName = profile?.full_name ?? "User";
  const displayRole = profile?.role ?? "staff";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
          <Menu className="w-4 h-4" />
        </Button>
        {title && (
          <div>
            <h1 className="text-sm font-semibold font-display text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 h-8 px-3 bg-muted/60 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="hidden lg:inline text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </div>

        <Button variant="ghost" size="icon" onClick={onThemeToggle}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border ml-1">
          <Avatar name={displayName} size="sm" showOnline />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[80px]">
              {displayName.split(" ")[0]} {displayName.split(" ")[1]?.[0] ? displayName.split(" ")[1][0] + "." : ""}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight capitalize">{displayRole}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out" className="text-muted-foreground hover:text-red-500">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
