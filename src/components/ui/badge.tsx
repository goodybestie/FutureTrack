"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
  dot?: boolean;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
  warning: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  danger: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
  info: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  neutral: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50",
};

const dotStyles = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
};

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
      variantStyles[variant],
      className
    )}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}
