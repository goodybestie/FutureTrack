"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { mockLateArrivals } from "@/data/mock";
import { cn, getInitials } from "@/lib/utils";
import { Clock, AlertTriangle, ChevronDown } from "lucide-react";

function MinutesBadge({ minutes }: { minutes: number }) {
  const color = minutes >= 45 ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
    : minutes >= 20 ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40"
    : "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full", color)}>
      <Clock className="w-3 h-3" />
      +{minutes}m
    </span>
  );
}

export function LateArrivalsPanel() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? mockLateArrivals : mockLateArrivals.slice(0, 3);

  const totalLateMinutes = mockLateArrivals.reduce((s, l) => s + l.minutesLate, 0);
  const worstOffender = mockLateArrivals[0];

  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Late Arrivals</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mockLateArrivals.length} employees · {totalLateMinutes} total mins lost
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-semibold">{mockLateArrivals.filter(l => l.minutesLate >= 30).length} flagged</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {displayed.map((arrival, i) => (
          <motion.div
            key={arrival.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
          >
            {/* Rank */}
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
              i === 0 ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
              i === 1 ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
              "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </span>

            {/* Avatar */}
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", arrival.avatarColor)}>
              {getInitials(arrival.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{arrival.name}</p>
              <p className="text-xs text-muted-foreground">{arrival.department}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-1">
              <MinutesBadge minutes={arrival.minutesLate} />
              <span className="text-[10px] text-muted-foreground">
                {arrival.occurrences}× this month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {mockLateArrivals.length > 3 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors border-t border-border"
        >
          {showAll ? "Show less" : `Show ${mockLateArrivals.length - 3} more`}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAll && "rotate-180")} />
        </button>
      )}
    </Card>
  );
}
