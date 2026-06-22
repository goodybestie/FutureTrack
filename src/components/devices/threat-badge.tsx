"use client";
import { cn } from "@/lib/utils";
import type { ThreatLevel, DeviceStatus } from "@/lib/detection-engine/types";
import { ShieldAlert, Shield, Eye, ShieldCheck } from "lucide-react";

const threatCfg: Record<ThreatLevel, { label: string; text: string; bg: string; dot: string; pulse: boolean }> = {
  critical: { label: "Critical",  text: "text-red-700 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/50",     dot: "bg-red-500", pulse: true },
  high:     { label: "High",      text: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/50", dot: "bg-orange-500", pulse: true },
  medium:   { label: "Medium",    text: "text-amber-700 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/50",  dot: "bg-amber-500", pulse: false },
  low:      { label: "Low",       text: "text-slate-600 dark:text-slate-400",  bg: "bg-slate-100 dark:bg-slate-800/50", dot: "bg-slate-400", pulse: false },
};

const statusCfg: Record<DeviceStatus, { label: string; text: string; bg: string; icon: React.ElementType }> = {
  active:     { label: "Active Threat", text: "text-red-700 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/50",     icon: ShieldAlert },
  blocked:    { label: "Blocked",       text: "text-slate-600 dark:text-slate-400",  bg: "bg-slate-100 dark:bg-slate-800/50", icon: Shield },
  monitoring: { label: "Monitoring",    text: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/50",    icon: Eye },
  approved:   { label: "Approved",      text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", icon: ShieldCheck },
};

export function ThreatBadge({ level, size = "sm" }: { level: ThreatLevel; size?: "xs" | "sm" }) {
  const cfg = threatCfg[level];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-semibold",
      size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
      cfg.text, cfg.bg
    )}>
      <span className={cn("rounded-full shrink-0 w-1.5 h-1.5", cfg.dot, cfg.pulse && "animate-pulse")} />
      {cfg.label}
    </span>
  );
}

export function DeviceStatusBadge({ status, size = "sm" }: { status: DeviceStatus; size?: "xs" | "sm" }) {
  const cfg = statusCfg[status];
  const Icon = cfg.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-medium",
      size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
      cfg.text, cfg.bg
    )}>
      <Icon className="w-3 h-3 shrink-0" />
      {cfg.label}
    </span>
  );
}
