"use client";
import { cn } from "@/lib/utils";
import { getSignalBars, getSignalLabel } from "@/lib/wifi-engine/state-machine";

interface SignalIconProps {
  dbm: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function SignalIcon({ dbm, size = "sm", showLabel, className }: SignalIconProps) {
  const bars = getSignalBars(dbm);
  const label = getSignalLabel(dbm);

  const barH = size === "sm"
    ? ["h-1", "h-1.5", "h-2.5", "h-3.5"]
    : ["h-1.5", "h-2", "h-3.5", "h-5"];

  const colorMap: Record<1 | 2 | 3 | 4, string> = {
    1: "text-red-500",
    2: "text-amber-500",
    3: "text-blue-500",
    4: "text-emerald-500",
  };

  return (
    <span className={cn("inline-flex items-end gap-[2px]", colorMap[bars], className)}
      title={`${label} (${dbm} dBm)`}>
      {barH.map((h, i) => (
        <span
          key={i}
          className={cn(
            "rounded-[1px] transition-all duration-500",
            size === "sm" ? "w-[3px]" : "w-1",
            h,
            i < bars ? "opacity-100 bg-current" : "opacity-20 bg-current"
          )}
        />
      ))}
      {showLabel && (
        <span className="ml-1 text-[10px] font-medium">{label}</span>
      )}
    </span>
  );
}
