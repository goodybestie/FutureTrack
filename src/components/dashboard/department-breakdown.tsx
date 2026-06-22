"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDepartments } from "@/data/mock";
import { cn } from "@/lib/utils";

export function DepartmentBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Breakdown</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {mockDepartments.map((dept) => {
          const rate = Math.round((dept.presentToday / dept.headCount) * 100);
          const color = rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-blue-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={dept.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full", color)} />
                  <span className="text-xs font-medium text-foreground">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{dept.presentToday}/{dept.headCount}</span>
                  <span className={cn(
                    "font-semibold tabular-nums",
                    rate >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                    rate >= 70 ? "text-blue-600 dark:text-blue-400" :
                    "text-amber-600 dark:text-amber-400"
                  )}>{rate}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", color)}
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
