"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProductivity } from "@/data/mock";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const radarData = mockProductivity.map(p => ({
  dept: p.department.slice(0, 3),
  score: p.score,
  hours: Math.round(p.avgHours * 10),
  rate: p.attendanceRate,
}));

export function DeptProductivityScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
      </CardHeader>

      {/* Radar chart */}
      <div className="h-44 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 0, right: 16, bottom: 0, left: 16 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="dept"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
            />
            <Radar
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-2">
        {[...mockProductivity].sort((a, b) => b.score - a.score).map((dept, i) => (
          <motion.div
            key={dept.department}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="w-5 text-xs text-muted-foreground text-right shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate">{dept.department}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={cn(
                    "text-xs font-bold",
                    dept.score >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                    dept.score >= 80 ? "text-blue-600 dark:text-blue-400" :
                    "text-amber-600 dark:text-amber-400"
                  )}>
                    {dept.score}
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-0.5 text-[10px]",
                    dept.trend > 0 ? "text-emerald-600 dark:text-emerald-400" :
                    dept.trend < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {dept.trend > 0 ? <TrendingUp className="w-3 h-3" /> :
                     dept.trend < 0 ? <TrendingDown className="w-3 h-3" /> :
                     <Minus className="w-3 h-3" />}
                    {dept.trend !== 0 && Math.abs(dept.trend)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    dept.score >= 90 ? "bg-emerald-500" :
                    dept.score >= 80 ? "bg-blue-500" : "bg-amber-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.score}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
