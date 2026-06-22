"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { mockChartData } from "@/data/mock";
import { cn } from "@/lib/utils";

const COLORS = {
  present: "#3b82f6",
  absent: "#f43f5e",
  late: "#f59e0b",
  remote: "#8b5cf6" };

type ChartType = "area" | "bar";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-hover text-xs">
      <p className="font-semibold mb-2 text-foreground font-display">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AttendanceChart() {
  const [chartType, setChartType] = useState<ChartType>("area");

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Weekly Attendance Overview</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Past 7 days — all departments</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(["area", "bar"] as ChartType[]).map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                chartType === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "area" ? "Area" : "Bar"}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className="flex gap-4 mb-4">
        {Object.entries(COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            <span className="text-xs text-muted-foreground capitalize">{key}</span>
          </div>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={mockChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                {Object.entries(COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {Object.entries(COLORS).map(([key, color]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${key})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={mockChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {Object.entries(COLORS).map(([key, color]) => (
                <Bar key={key} dataKey={key} fill={color} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
