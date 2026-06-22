"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceTrendChart } from "@/components/analytics/attendance-trend-chart";
import { ProductivityHeatmap } from "@/components/analytics/productivity-heatmap";
import { LateArrivalsPanel } from "@/components/analytics/late-arrivals-panel";
import { DeptProductivityScores } from "@/components/analytics/dept-productivity-scores";
import { ExportButton } from "@/components/analytics/export-button";
import { mockTrends, mockProductivity } from "@/data/mock";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart2, Clock, Users, Award, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

function InsightCard({ icon: Icon, label, value, sub, color, trend, index }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; trend?: number; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend !== undefined && (
          <span className={cn("text-xs font-medium flex items-center gap-0.5",
            trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
          )}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-display tabular-nums text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// Check-in time distribution
const checkInDistribution = [
  { time: "Before 8am", count: 4 }, { time: "8–8:30am", count: 12 },
  { time: "8:30–9am", count: 22 },  { time: "9–9:30am", count: 14 },
  { time: "9:30–10am", count: 5 },  { time: "After 10am", count: 2 },
];
const distColors = ["#10b981","#3b82f6","#3b82f6","#f59e0b","#f97316","#ef4444"];

// Attendance by day of week
const byDayOfWeek = [
  { day: "Mon", rate: 91 }, { day: "Tue", rate: 94 }, { day: "Wed", rate: 89 },
  { day: "Thu", rate: 96 }, { day: "Fri", rate: 87 }, { day: "Sat", rate: 22 },
  { day: "Sun", rate: 8 },
];

// Work mode split
const workModeSplit = [
  { name: "In-office", value: 68, fill: "#3b82f6" },
  { name: "Remote",    value: 24, fill: "#8b5cf6" },
  { name: "Hybrid",    value: 8,  fill: "#06b6d4" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-2.5 shadow-card-hover text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold">{p.value}{p.dataKey === "rate" ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const avgRate = Math.round(mockTrends.reduce((s, t) => s + t.rate, 0) / mockTrends.length);
  const topDept = [...mockProductivity].sort((a, b) => b.score - a.score)[0];

  return (
    <DashboardLayout title="Analytics" subtitle="Deep attendance insights & productivity metrics">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
          <span className="text-xs text-muted-foreground font-medium">Live data · last 30 days</span>
        </div>
        <ExportButton />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <InsightCard index={0} icon={BarChart2} label="Avg Attendance Rate" value={`${avgRate}%`}
          sub="30-day average" color="bg-primary/10" trend={1.8} />
        <InsightCard index={1} icon={Clock} label="Avg Check-in Time" value="08:42"
          sub="across all employees" color="bg-emerald-50 dark:bg-emerald-950/40" trend={-2} />
        <InsightCard index={2} icon={Users} label="Top Department" value={topDept.department}
          sub={`${topDept.score} performance score`} color="bg-violet-50 dark:bg-violet-950/40" />
        <InsightCard index={3} icon={Award} label="Perfect Attendance" value="14"
          sub="employees this month" color="bg-amber-50 dark:bg-amber-950/40" trend={3} />
      </div>

      {/* Row 1: Trend chart full width */}
      <div className="mb-4">
        <AttendanceTrendChart />
      </div>

      {/* Row 2: Heatmap + late arrivals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <ProductivityHeatmap />
        </div>
        <LateArrivalsPanel />
      </div>

      {/* Row 3: Check-in distribution + day-of-week + work mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Check-in time distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Distribution</CardTitle>
          </CardHeader>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInDistribution} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {checkInDistribution.map((_, i) => (
                    <Cell key={i} fill={distColors[i] ?? "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance by day */}
        <Card>
          <CardHeader>
            <CardTitle>By Day of Week</CardTitle>
          </CardHeader>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDayOfWeek} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {byDayOfWeek.map((d, i) => (
                    <Cell key={i} fill={d.rate >= 80 ? "#3b82f6" : d.rate >= 50 ? "#f59e0b" : "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Work mode split */}
        <Card>
          <CardHeader>
            <CardTitle>Work Mode Split</CardTitle>
          </CardHeader>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={workModeSplit} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  dataKey="value" paddingAngle={3}>
                  {workModeSplit.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 10 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 4: Department performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <Card padding="none">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <CardTitle>Department Deep-Dive</CardTitle>
              <ExportButton variant="dropdown" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Department","Score","Trend","Avg Hours","Attendance %","Action"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...mockProductivity].sort((a, b) => b.score - a.score).map((dept, i) => (
                    <motion.tr key={dept.department}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{dept.department}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold",
                            dept.score >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                            dept.score >= 80 ? "text-blue-600 dark:text-blue-400" : "text-amber-600"
                          )}>{dept.score}</span>
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full",
                              dept.score >= 90 ? "bg-emerald-500" : dept.score >= 80 ? "bg-blue-500" : "bg-amber-500"
                            )} style={{ width: `${dept.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold flex items-center gap-0.5",
                          dept.trend > 0 ? "text-emerald-600 dark:text-emerald-400" :
                          dept.trend < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {dept.trend > 0 ? "↑" : dept.trend < 0 ? "↓" : "—"}
                          {dept.trend !== 0 && Math.abs(dept.trend)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground font-mono-custom">{dept.avgHours}h</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground">{dept.attendanceRate}%</span>
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${dept.attendanceRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-primary hover:underline">View report</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <DeptProductivityScores />
      </div>

      {/* Export section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Export Reports</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Download data in CSV or JSON format</p>
          </div>
        </CardHeader>
        <ExportButton variant="inline" />
      </Card>
    </DashboardLayout>
  );
}
