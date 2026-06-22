"use client";
import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTrends } from "@/data/mock";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-hover text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-2 font-display">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.dataKey === "rate" ? "Rate" : p.dataKey}</span>
          </div>
          <span className="font-semibold text-foreground">
            {p.dataKey === "rate" ? `${p.value}%` : p.dataKey === "avgHours" ? `${p.value}h` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

type Mode = "rate" | "breakdown" | "hours";

export function AttendanceTrendChart() {
  const [mode, setMode] = useState<Mode>("rate");
  const [range, setRange] = useState<7 | 14 | 30>(30);

  const data = mockTrends.slice(-range);
  const avg = Math.round(data.reduce((s, d) => s + d.rate, 0) / data.length);
  const lastRate = data[data.length - 1]?.rate ?? 0;
  const prevRate = data[data.length - 8]?.rate ?? lastRate;
  const delta = lastRate - prevRate;

  const modes: { key: Mode; label: string }[] = [
    { key: "rate",      label: "Attendance %" },
    { key: "breakdown", label: "Breakdown" },
    { key: "hours",     label: "Avg Hours" },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Attendance Trends</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">30-day analysis</p>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full",
              delta >= 0
                ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
                : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
            )}>
              {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(delta)}% vs last week
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Mode switcher */}
          <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
            {modes.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={cn("px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                  mode === m.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {m.label}
              </button>
            ))}
          </div>
          {/* Range switcher */}
          <div className="flex gap-1 p-0.5 bg-muted rounded-lg ml-0 sm:ml-2">
            {([7, 14, 30] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={cn("px-2 py-1 text-xs font-medium rounded-md transition-all",
                  range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {r}d
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Summary numbers */}
      <div className="flex gap-6 mb-4">
        <div>
          <p className="text-2xl font-bold font-display tabular-nums">{avg}%</p>
          <p className="text-xs text-muted-foreground">Avg rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">
            {data.filter(d => d.rate >= 90).length}
          </p>
          <p className="text-xs text-muted-foreground">Days ≥90%</p>
        </div>
        <div>
          <p className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">
            {data.reduce((s, d) => s + d.late, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total late</p>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "rate" ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                interval={range === 7 ? 0 : range === 14 ? 1 : 4} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} opacity={0.6} />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2}
                fill="url(#rateGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          ) : mode === "breakdown" ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {[["presentGrad","#10b981"],["lateGrad","#f59e0b"],["absentGrad","#f43f5e"]].map(([id,c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={1.5} fill="url(#presentGrad)" dot={false} />
              <Area type="monotone" dataKey="late"    stroke="#f59e0b" strokeWidth={1.5} fill="url(#lateGrad)"    dot={false} />
              <Area type="monotone" dataKey="absent"  stroke="#f43f5e" strokeWidth={1.5} fill="url(#absentGrad)"  dot={false} />
            </AreaChart>
          ) : (
            <LineChart data={data.filter(d => d.avgHours > 0)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[6, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={8} stroke="#8b5cf6" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
              <Line type="monotone" dataKey="avgHours" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
