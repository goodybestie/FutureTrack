"use client";
import { useSessions, useTick } from "@/stores/wifi-store";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/lib/wifi-engine/types";

const WORK_START_HOUR = 7;
const WORK_END_HOUR = 20;
const TOTAL_MINS = (WORK_END_HOUR - WORK_START_HOUR) * 60;

function timeToPct(date: Date | null): number {
  if (!date) return 0;
  const d = new Date(date);
  const minsFromStart = (d.getHours() - WORK_START_HOUR) * 60 + d.getMinutes();
  return Math.max(0, Math.min(100, (minsFromStart / TOTAL_MINS) * 100));
}

function nowPct(): number {
  const now = new Date();
  const minsFromStart = (now.getHours() - WORK_START_HOUR) * 60 + now.getMinutes();
  return Math.max(0, Math.min(100, (minsFromStart / TOTAL_MINS) * 100));
}

function SessionBar({ session }: { session: UserSession }) {
  useTick(); // re-render every second
  if (!session.checkInTime) return null;

  const startPct = timeToPct(session.checkInTime);
  const endPct = session.checkOutTime
    ? timeToPct(session.checkOutTime)
    : Math.min(nowPct(), 100);

  const widthPct = Math.max(endPct - startPct, 0.5);
  const isActive = session.connectionState === "connected";
  const isLate = session.isLateArrival;

  return (
    <div
      className={cn(
        "absolute top-1 bottom-1 rounded-full transition-all duration-500",
        isActive
          ? isLate
            ? "bg-amber-400 dark:bg-amber-500"
            : "bg-emerald-400 dark:bg-emerald-500"
          : "bg-slate-300 dark:bg-slate-600",
        isActive && "opacity-90"
      )}
      style={{ left: `${startPct}%`, width: `${widthPct}%` }}
      title={`${session.userName}: ${session.connectionState}`}
    />
  );
}

const HOUR_MARKS = Array.from(
  { length: WORK_END_HOUR - WORK_START_HOUR + 1 },
  (_, i) => WORK_START_HOUR + i
);

export function ConnectionTimeline() {
  const sessions = useSessions();
  useTick();
  const now = nowPct();

  const withCheckIn = sessions
    .filter(s => s.checkInTime !== null)
    .sort((a, b) => {
      const at = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const bt = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return at - bt;
    });

  return (
    <div className="overflow-x-auto">
      {/* Hour labels */}
      <div className="relative mb-1 pr-2" style={{ minWidth: 480 }}>
        <div className="flex justify-between px-[72px]">
          {HOUR_MARKS.map(h => (
            <span key={h} className="text-[10px] text-muted-foreground/60 font-mono-custom">
              {h < 10 ? `0${h}` : h}:00
            </span>
          ))}
        </div>
      </div>

      {/* Timeline rows */}
      <div className="space-y-1" style={{ minWidth: 480 }}>
        {withCheckIn.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            No sessions today — connect users to see timeline
          </div>
        ) : (
          withCheckIn.map(session => (
            <div key={session.userId} className="flex items-center gap-2 pr-2">
              {/* Name label */}
              <div className="w-[68px] shrink-0 text-right">
                <span className="text-[10px] text-muted-foreground truncate block" title={session.userName}>
                  {session.userName.split(" ")[0]}
                </span>
              </div>

              {/* Bar track */}
              <div className="flex-1 h-5 bg-muted/40 rounded-full relative overflow-hidden">
                <SessionBar session={session} />
                {/* Work start marker (9am) */}
                <div className="absolute top-0 bottom-0 w-px bg-primary/20"
                  style={{ left: `${timeToPct(new Date(new Date().setHours(9, 0, 0, 0)))}%` }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Now indicator */}
      <div className="relative mt-1 pr-2" style={{ minWidth: 480 }}>
        <div className="absolute w-px bg-primary/60 top-0 bottom-0 -translate-y-full" style={{ left: `calc(68px + 8px + ${now}% * (100% - 68px - 8px - 8px) / 100)` }}>
          <span className="absolute -top-4 -translate-x-1/2 text-[10px] text-primary font-medium font-mono-custom whitespace-nowrap">
            Now
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pl-[76px]">
        {[
          { color: "bg-emerald-400 dark:bg-emerald-500", label: "On time" },
          { color: "bg-amber-400 dark:bg-amber-500",   label: "Late arrival" },
          { color: "bg-slate-300 dark:bg-slate-600",   label: "Checked out" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-2 rounded-full", l.color)} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
