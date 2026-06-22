"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { mockNotifications } from "@/data/mock";
import { ShieldAlert, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  warning: AlertTriangle,
  error: ShieldAlert,
  success: CheckCircle,
  info: Info };

const colorMap = {
  warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  error: "text-red-500 bg-red-50 dark:bg-red-950/40",
  success: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
  info: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" };

const badgeMap = {
  warning: "warning" as const,
  error: "danger" as const,
  success: "success" as const,
  info: "info" as const };

export function RecentAlerts() {
  const alerts = mockNotifications.slice(0, 4);

  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-border">
        <CardTitle>Recent Alerts</CardTitle>
      </div>
      <div className="divide-y divide-border">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <div key={alert.id} className={cn(
              "flex gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors",
              !alert.read && "bg-primary/2"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                colorMap[alert.type]
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground leading-tight">{alert.title}</p>
                  {!alert.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
