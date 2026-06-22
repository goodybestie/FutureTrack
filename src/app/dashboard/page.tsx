"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { DepartmentBreakdown } from "@/components/dashboard/department-breakdown";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRealtimeUnauthorizedDevices } from "@/hooks/use-realtime-devices";
import { getTodayStats } from "@/lib/actions/attendance";
import { mockStats } from "@/data/mock";
import { useSessionStats, useSessions } from "@/stores/wifi-store";
import { useDetectionStats } from "@/stores/detection-store";
import { getInitials, cn } from "@/lib/utils";
import {
  Users, UserCheck, UserX, Clock, Wifi, ShieldAlert, TrendingUp, Activity,
  MapPin, ArrowRight, Radio } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { TodayAttendanceSummary } from "@/types/database";
import { ConnectionBadge } from "@/components/attendance/connection-badge";
import { LiveDuration } from "@/components/attendance/live-duration";

export default function DashboardPage() {
  const [dbStats, setDbStats] = useState<TodayAttendanceSummary | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const { data: unauthorizedDevices } = useRealtimeUnauthorizedDevices();
  const detectionStats = useDetectionStats();
  const wifiStats = useSessionStats();
  const sessions = useSessions();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric" });

  useEffect(() => {
    getTodayStats().then(data => {
      setDbStats(data);
      setStatsLoading(false);
    });
  }, []);

  // Prefer live WiFi engine stats, fall back to DB / mock
  const presentToday = wifiStats.checkedIn || dbStats?.present || mockStats.presentToday;
  const lateArrivals = wifiStats.late || dbStats?.late || mockStats.lateArrivals;
  const remoteWorkers = sessions.filter(s => s.location?.includes("Remote") && s.connectionState === "connected").length || mockStats.remoteWorkers;
  // Prefer live detection engine stats; fall back to Supabase realtime, then mock
  const unauthorizedCount = detectionStats.active > 0
    ? detectionStats.active
    : unauthorizedDevices.filter(d => !d.blocked).length || mockStats.unauthorizedDevices;

  const onlineSessions = sessions
    .filter(s => s.connectionState === "connected")
    .slice(0, 6);

  return (
    <DashboardLayout title="Dashboard" subtitle={today}>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
        <span className="text-xs text-muted-foreground font-medium">Live data · updates in real-time via WiFi engine</span>
        <Link href="/dashboard/live">
          <Button variant="ghost" size="xs" icon={<Radio className="w-3 h-3 text-emerald-500" />} className="ml-1">
            Open Live Monitor
          </Button>
        </Link>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard index={0} title="Online Now" value={wifiStats.connected}
              subtitle="connected to WiFi"
              trend={{ value: 5.2, label: "vs. yesterday" }}
              icon={<Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
              accent="bg-gradient-to-r from-emerald-400 to-emerald-500" pulse />
            <StatCard index={1} title="Checked In" value={presentToday}
              subtitle={`of ${wifiStats.total} employees`}
              icon={<UserCheck className="w-5 h-5 text-primary" />}
              iconBg="bg-primary/10"
              accent="bg-gradient-to-r from-blue-400 to-blue-500" />
            <StatCard index={2} title="Late Arrivals" value={lateArrivals}
              subtitle="After 09:15 AM"
              icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              iconBg="bg-amber-50 dark:bg-amber-950/40"
              accent="bg-gradient-to-r from-amber-400 to-amber-500" />
            <StatCard index={3} title="Not In Yet" value={wifiStats.absent}
              subtitle="Never connected today"
              icon={<UserX className="w-5 h-5 text-red-500" />}
              iconBg="bg-red-50 dark:bg-red-950/40"
              accent="bg-gradient-to-r from-red-400 to-red-500" />
          </>
        )}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard index={4} title="Attendance Rate"
          value={`${wifiStats.total ? Math.round(((wifiStats.checkedIn + wifiStats.checkedOut) / wifiStats.total) * 100) : 0}%`}
          subtitle="today"
          trend={{ value: 1.8, label: "vs. last week" }}
          icon={<TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
          iconBg="bg-violet-50 dark:bg-violet-950/40" />
        <StatCard index={5} title="Remote Workers" value={remoteWorkers}
          subtitle="via VPN"
          icon={<Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          iconBg="bg-cyan-50 dark:bg-cyan-950/40" />
        <StatCard index={6} title="Total Employees" value={wifiStats.total}
          subtitle="registered"
          icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/40" />
        <StatCard index={7} title="Unauth. Devices" value={unauthorizedCount}
          subtitle="needs review"
          icon={<ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          iconBg="bg-rose-50 dark:bg-rose-950/40"
          accent="bg-gradient-to-r from-rose-400 to-rose-500" />
      </div>

      {/* Chart + departments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2"><AttendanceChart /></div>
        <DepartmentBreakdown />
      </div>

      {/* Online right now + alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Card padding="none">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold font-display">Currently Online</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
                  <p className="text-xs text-muted-foreground">
                    {wifiStats.connected} users on {sessions[0]?.ssid ?? "FutureTrack-Corp-5GHz"}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/live">
                <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                  Live monitor
                </Button>
              </Link>
            </div>

            {onlineSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wifi className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No users online</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                 {`Head to Live Monitor and click "Connect All" to simulate check-ins`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {onlineSessions.map((session, i) => (
                  <motion.div
                    key={session.userId}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", session.avatarColor)}>
                      {getInitials(session.userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{session.userName}</p>
                      <p className="text-xs text-muted-foreground">{session.department}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {session.checkInTime
                          ? new Date(session.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[90px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{session.location}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ConnectionBadge state={session.connectionState} size="xs" />
                      <LiveDuration session={session} className="text-[10px] text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
        <RecentAlerts />
      </div>
    </DashboardLayout>
  );
}
