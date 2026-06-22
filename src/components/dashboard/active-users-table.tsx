"use client";

import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockAttendance } from "@/data/mock";
import { capitalizeFirst } from "@/lib/utils";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ActiveUsersTable() {
  const activeToday = mockAttendance.filter(a => a.date === "2025-05-09").slice(0, 6);

  type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

  const statusVariant = (status: string): BadgeVariant => {
    if (status === "present") return "success";
    if (status === "absent") return "danger";
    if (status === "late") return "warning";
    if (status === "remote") return "info";
    return "neutral";
  };

  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{`Today's Attendance`}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">May 9, 2025 — live tracking</p>
          </div>
          <Link href="/dashboard/attendance">
            <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
              View all
            </Button>
          </Link>
        </div>
      </div>

      <div className="divide-y divide-border">
        {activeToday.map((record, i) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
          >
            <Avatar name={record.userName} size="sm" showOnline={record.status !== "absent"} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{record.userName}</p>
              <p className="text-xs text-muted-foreground">{record.department}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{record.checkIn ?? "—"}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground max-w-[100px] truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{record.location}</span>
            </div>
            <Badge
              variant={statusVariant(record.status)}
              dot
            >
              {capitalizeFirst(record.status)}
            </Badge>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
