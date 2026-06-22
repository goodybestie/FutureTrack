"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: React.ReactNode;
  iconBg?: string;
  accent?: string;
  index?: number;
  pulse?: boolean;
}

export function StatCard({
  title, value, subtitle, trend, icon, iconBg, accent, index = 0, pulse
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 card-shine overflow-hidden"
    >
      {/* Accent line */}
      {accent && (
        <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-xl", accent)} />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          iconBg || "bg-primary/10"
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            isPositive ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
              : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-display text-foreground tabular-nums">
            {value}
          </span>
          {pulse && (
            <span className="inline-flex w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow mb-0.5" />
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground/70 mt-1">{trend.label}</p>
        )}
      </div>
    </motion.div>
  );
}
