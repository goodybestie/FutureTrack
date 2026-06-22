"use client";
import { useTick } from "@/stores/wifi-store";
import { computeLiveMinutes, formatDuration } from "@/lib/wifi-engine/state-machine";
import type { UserSession } from "@/lib/wifi-engine/types";
import { cn } from "@/lib/utils";

interface LiveDurationProps {
  session: UserSession;
  className?: string;
  pulse?: boolean;
}

export function LiveDuration({ session, className, pulse }: LiveDurationProps) {
  // Re-renders every second via the store ticker
  useTick();
  const minutes = computeLiveMinutes(session);
  const isLive = session.connectionState === "connected";

  if (minutes < 0.1 && !session.checkInTime) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  return (
    <span className={cn("tabular-nums font-mono-custom", className)}>
      {isLive && pulse && (
        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse-slow align-middle" />
      )}
      {formatDuration(minutes)}
    </span>
  );
}
