"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventLog } from "@/stores/wifi-store";
import { cn } from "@/lib/utils";
import type { WifiEvent, EventType } from "@/lib/wifi-engine/types";
import {
  Wifi, WifiOff, LogIn, LogOut, RefreshCw,
  AlertTriangle, CheckCircle, Activity, Shield } from "lucide-react";

const eventConfig: Record<EventType, { icon: React.ElementType; color: string; bg: string }> = {
  CONNECT:           { icon: Wifi,          color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  DISCONNECT:        { icon: WifiOff,       color: "text-slate-500",                          bg: "bg-slate-100 dark:bg-slate-800/50" },
  RECONNECT:         { icon: RefreshCw,     color: "text-blue-600 dark:text-blue-400",        bg: "bg-blue-50 dark:bg-blue-950/40" },
  SIGNAL_DROP:       { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400",      bg: "bg-amber-50 dark:bg-amber-950/40" },
  SIGNAL_RESTORE:    { icon: Activity,      color: "text-cyan-600 dark:text-cyan-400",        bg: "bg-cyan-50 dark:bg-cyan-950/40" },
  CHECK_IN:          { icon: LogIn,         color: "text-primary",                            bg: "bg-primary/10" },
  CHECK_OUT:         { icon: LogOut,        color: "text-violet-600 dark:text-violet-400",    bg: "bg-violet-50 dark:bg-violet-950/40" },
  DUPLICATE_BLOCKED: { icon: Shield,        color: "text-orange-600 dark:text-orange-400",    bg: "bg-orange-50 dark:bg-orange-950/40" },
  SESSION_RESUMED:   { icon: CheckCircle,   color: "text-teal-600 dark:text-teal-400",        bg: "bg-teal-50 dark:bg-teal-950/40" },
  UNAUTHORIZED:      { icon: Shield,        color: "text-red-600 dark:text-red-400",          bg: "bg-red-50 dark:bg-red-950/40" } };

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 5)  return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function EventRow({ event, isNew }: { event: WifiEvent; isNew: boolean }) {
  const cfg = eventConfig[event.type] ?? eventConfig.CONNECT;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -12, backgroundColor: "hsl(var(--primary) / 0.06)" } : false}
      animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group"
    >
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
        <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-foreground truncate">{event.userName}</span>
          <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
            {timeAgo(event.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">{event.message}</p>
        {event.ipAddress && (
          <p className="text-[10px] text-muted-foreground/50 font-mono-custom mt-0.5">
            {event.ipAddress} · {event.department}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface LiveEventFeedProps {
  maxHeight?: string;
  limit?: number;
}

export function LiveEventFeed({ maxHeight = "400px", limit = 60 }: LiveEventFeedProps) {
  const events = useEventLog();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const newCount = Math.max(0, events.length - prevCountRef.current);

  useEffect(() => {
    // Auto-scroll to top (newest events) when new events arrive
    if (scrollRef.current && newCount > 0) {
      scrollRef.current.scrollTop = 0;
    }
    prevCountRef.current = events.length;
  }, [events.length, newCount]);

  const displayed = events.slice(0, limit);

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto scrollbar-thin divide-y divide-border"
      style={{ maxHeight }}
    >
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <Activity className="w-6 h-6 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No events yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Connect users or start auto-simulation to see live events
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {displayed.map((event, i) => (
            <EventRow key={event.id} event={event} isNew={i < newCount} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
