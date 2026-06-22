"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { SimulatorControls } from "@/components/attendance/simulator-controls";
import { ActiveUsersGrid } from "@/components/attendance/active-users-grid";
import { LiveEventFeed } from "@/components/attendance/live-event-feed";
import { AttendanceSummaryTable } from "@/components/attendance/attendance-summary-table";
import { ConnectionTimeline } from "@/components/attendance/connection-timeline";
import { useSessionStats, useTick } from "@/stores/wifi-store";
import { cn } from "@/lib/utils";
import { Users, Activity, AlignLeft } from "lucide-react";

type Tab = "grid" | "table" | "timeline";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "grid",     label: "User Cards",  icon: Users },
  { key: "table",    label: "Table View",  icon: AlignLeft },
  { key: "timeline", label: "Timeline",    icon: Activity },
];

function LiveStatPill({ label, value, sub, color }: {
  label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 min-w-[120px]"
    >
      <div>
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-2xl font-bold font-display tabular-nums leading-none", color)}
        >
          {value}
        </motion.p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function LiveMonitoringPage() {
  const stats = useSessionStats();
  const [tab, setTab] = useState<Tab>("grid");
  const [userFilter, setUserFilter] = useState<"all" | "online" | "offline">("all");
  useTick(); // keep stat counters fresh

  const attendanceRate = stats.total > 0
    ? Math.round(((stats.checkedIn + stats.checkedOut) / stats.total) * 100)
    : 0;

  return (
    <DashboardLayout title="Live Monitoring" subtitle="Real-time WiFi attendance tracking">
      {/* Hero stats bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <LiveStatPill label="Online Now"     value={stats.connected}   color="text-emerald-600 dark:text-emerald-400" sub="on WiFi" />
        <LiveStatPill label="Checked In"     value={stats.checkedIn}   color="text-primary"  sub="today" />
        <LiveStatPill label="Checked Out"    value={stats.checkedOut}  color="text-violet-600 dark:text-violet-400" sub="today" />
        <LiveStatPill label="Late Arrivals"  value={stats.late}        color="text-amber-600 dark:text-amber-400" />
        <LiveStatPill label="Not In Yet"     value={stats.absent}      color="text-muted-foreground" />
        <LiveStatPill label="Attendance"     value={`${attendanceRate}%`} color="text-foreground" sub="today" />
      </div>

      {/* Simulator controls */}
      <div className="mb-5">
        <SimulatorControls />
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left — user view tabs */}
        <div className="xl:col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    tab === t.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filter pills (grid only) */}
            {tab === "grid" && (
              <div className="flex gap-1 ml-auto">
                {(["all", "online", "offline"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize",
                      userFilter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground bg-background"
                    )}
                  >
                    {f === "all" ? `All (${stats.total})` : f === "online" ? `Online (${stats.connected})` : `Offline (${stats.offline})`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab panels */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "grid" && (
              <ActiveUsersGrid filter={userFilter} />
            )}

            {tab === "table" && (
              <Card padding="none">
                <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
                  <h3 className="text-sm font-semibold font-display">Attendance Summary</h3>
                  <span className="text-xs text-muted-foreground ml-1">— {stats.total} employees</span>
                </div>
                <AttendanceSummaryTable />
              </Card>
            )}

            {tab === "timeline" && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
                  <h3 className="text-sm font-semibold font-display">Connection Timeline</h3>
                  <span className="text-xs text-muted-foreground">  {`Today's sessions`}</span>
                </div>
                <ConnectionTimeline />
              </Card>
            )}
          </motion.div>
        </div>

        {/* Right — live event feed */}
        <div>
          <Card padding="none" className="sticky top-4">
            <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow" />
                <h3 className="text-sm font-semibold font-display">Live Event Feed</h3>
              </div>
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded-full">
                Auto-scroll
              </span>
            </div>
            <LiveEventFeed maxHeight="calc(100vh - 320px)" />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
