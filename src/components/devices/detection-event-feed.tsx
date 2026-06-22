"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDetectionEventLog } from "@/stores/detection-store";
import { cn } from "@/lib/utils";
import type { DetectionEvent } from "@/lib/detection-engine/types";
import { ShieldAlert, Shield, Eye, CheckCircle, AlertTriangle, Activity, Wifi, UserPlus, Trash2 } from "lucide-react";

const eventIconMap = {
  NEW_DEVICE:          { icon: ShieldAlert, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-950/50" },
  RECONNECT_ATTEMPT:   { icon: Wifi,        color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/50" },
  BLOCKED_ATTEMPT:     { icon: Shield,      color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800" },
  PORT_SCAN:           { icon: Activity,    color: "text-red-600",    bg: "bg-red-100 dark:bg-red-900/60" },
  HIGH_FREQUENCY:      { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/50" },
  APPROVED:            { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  BLOCKED:             { icon: Shield,      color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800" },
  REMOVED:             { icon: Trash2,      color: "text-slate-400",  bg: "bg-slate-50 dark:bg-slate-900/50" },
  CONVERTED:           { icon: UserPlus,    color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/50" },
  MONITORING_STARTED:  { icon: Eye,         color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/50" },
};

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 5)  return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const severityBar: Record<string, string> = {
  critical: "bg-red-500",
  warning:  "bg-amber-500",
  info:     "bg-blue-400",
  success:  "bg-emerald-500",
};

function EventRow({ event, isNew }: { event: DetectionEvent; isNew: boolean }) {
  const cfg = eventIconMap[event.type] ?? eventIconMap.NEW_DEVICE;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -8, backgroundColor: "hsl(var(--primary) / 0.05)" } : false}
      animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/20 transition-colors group relative"
    >
      {/* Severity left-bar */}
      <div className={cn("absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full", severityBar[event.severity] ?? "bg-muted")} />

      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
        <Icon className={cn("w-3 h-3", cfg.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-[11px] font-semibold text-foreground truncate">{event.deviceName}</span>
          <span className="text-[10px] text-muted-foreground/50 shrink-0 tabular-nums">{timeAgo(event.timestamp)}</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{event.message}</p>
        <p className="text-[9px] text-muted-foreground/40 font-mono-custom mt-0.5">{event.ipAddress} · {event.macAddress}</p>
      </div>
    </motion.div>
  );
}

export function DetectionEventFeed({ maxHeight = "380px" }: { maxHeight?: string }) {
  const events = useDetectionEventLog();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const newCount = Math.max(0, events.length - prevCountRef.current);

  useEffect(() => {
    if (scrollRef.current && newCount > 0) {
      scrollRef.current.scrollTop = 0;
    }
    prevCountRef.current = events.length;
  }, [events.length, newCount]);

  return (
    <div ref={scrollRef} className="overflow-y-auto scrollbar-thin divide-y divide-border/50" style={{ maxHeight }}>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Shield className="w-6 h-6 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No events yet</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {events.slice(0, 80).map((event, i) => (
            <EventRow key={event.id} event={event} isNew={i < newCount} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
