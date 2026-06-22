"use client";
import { cn } from "@/lib/utils";
import type { ConnectionState, AttendanceStatus } from "@/lib/wifi-engine/types";

interface ConnectionBadgeProps {
  state: ConnectionState;
  className?: string;
  size?: "xs" | "sm";
}

const stateConfig: Record<ConnectionState, { label: string; dot: string; text: string; bg: string }> = {
  connected:     { label: "Online",        dot: "bg-emerald-500 animate-pulse",    text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  connecting:    { label: "Connecting…",   dot: "bg-blue-500 animate-pulse",       text: "text-blue-700 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/40" },
  reconnecting:  { label: "Reconnecting…", dot: "bg-amber-500 animate-pulse",      text: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/40" },
  disconnecting: { label: "Leaving…",      dot: "bg-slate-400",                    text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-slate-800/50" },
  offline:       { label: "Offline",       dot: "bg-slate-400",                    text: "text-slate-500 dark:text-slate-500",   bg: "bg-slate-100 dark:bg-slate-800/40" },
};

export function ConnectionBadge({ state, className, size = "sm" }: ConnectionBadgeProps) {
  const cfg = stateConfig[state];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-medium",
      size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
      cfg.text, cfg.bg, className
    )}>
      <span className={cn("rounded-full shrink-0", cfg.dot, size === "xs" ? "w-1.5 h-1.5" : "w-1.5 h-1.5")} />
      {cfg.label}
    </span>
  );
}

interface AttendanceBadgeProps {
  status: AttendanceStatus;
  className?: string;
  size?: "xs" | "sm";
}

const attendanceConfig: Record<AttendanceStatus, { label: string; dot: string; text: string; bg: string }> = {
  checked_in:  { label: "Present",     dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  late:        { label: "Late",        dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/40" },
  checked_out: { label: "Checked Out", dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-slate-800/50" },
  absent:      { label: "Absent",      dot: "bg-red-500",     text: "text-red-700 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/40" },
  not_started: { label: "Not In",      dot: "bg-slate-300",   text: "text-slate-500 dark:text-slate-500",   bg: "bg-slate-50 dark:bg-slate-800/30" },
};

export function AttendanceBadge({ status, className, size = "sm" }: AttendanceBadgeProps) {
  const cfg = attendanceConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-medium",
      size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
      cfg.text, cfg.bg, className
    )}>
      <span className={cn("rounded-full shrink-0 w-1.5 h-1.5", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
