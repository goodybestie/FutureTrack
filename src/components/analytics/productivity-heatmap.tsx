"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { mockHeatmap } from "@/data/mock";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getColor(value: number, max = 10): string {
  if (value === 0) return "";
  const intensity = value / max;
  if (intensity < 0.2) return "bg-blue-100 dark:bg-blue-950/30";
  if (intensity < 0.4) return "bg-blue-200 dark:bg-blue-900/40";
  if (intensity < 0.6) return "bg-blue-300 dark:bg-blue-800/60";
  if (intensity < 0.8) return "bg-blue-400 dark:bg-blue-700/80";
  return "bg-blue-500 dark:bg-blue-600";
}

function getLabel(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

export function ProductivityHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; value: number } | null>(null);

  const getValue = (day: string, hour: number) =>
    mockHeatmap.find(c => c.day === day && c.hour === hour)?.value ?? 0;

  // Peak hours across all days
  const peakHour = HOURS.reduce((best, h) => {
    const total = DAYS.reduce((s, d) => s + getValue(d, h), 0);
    const bestTotal = DAYS.reduce((s, d) => s + getValue(d, best), 0);
    return total > bestTotal ? h : best;
  }, 9);

  const showHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Activity Heatmap</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Peak hour: <span className="font-semibold text-foreground">{getLabel(peakHour)}</span>
            {" · "}Darker = more activity
          </p>
        </div>
        {hoveredCell && (
          <div className="text-xs bg-muted/60 px-2.5 py-1.5 rounded-lg">
            <span className="font-semibold">{hoveredCell.day} {getLabel(hoveredCell.hour)}</span>
            {" · "}Score: <span className="font-bold text-primary">{hoveredCell.value}/10</span>
          </div>
        )}
      </CardHeader>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Hour labels */}
          <div className="flex gap-0.5 mb-1 pl-10">
            {showHours.map(h => (
              <div key={h} className="flex-1 text-center">
                {h % 3 === 0 && (
                  <span className="text-[9px] text-muted-foreground/60">{getLabel(h)}</span>
                )}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-1 mb-0.5">
              <span className="w-9 text-[10px] text-muted-foreground text-right pr-1 shrink-0">{day}</span>
              <div className="flex gap-0.5 flex-1">
                {showHours.map(h => {
                  const val = getValue(day, h);
                  return (
                    <div
                      key={h}
                      className={cn(
                        "flex-1 h-5 rounded-[3px] transition-all duration-150 cursor-pointer",
                        "hover:ring-1 hover:ring-primary/40 hover:scale-110",
                        val === 0 ? "bg-muted/30" : getColor(val),
                        hoveredCell?.day === day && hoveredCell?.hour === h && "ring-1 ring-primary/60 scale-110"
                      )}
                      onMouseEnter={() => setHoveredCell({ day, hour: h, value: val })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 pl-10">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0, 2, 4, 6, 8, 10].map(v => (
              <div key={v} className={cn("w-4 h-4 rounded-[3px]", v === 0 ? "bg-muted/30" : getColor(v))} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
