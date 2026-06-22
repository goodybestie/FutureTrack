"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConnectionBadge, AttendanceBadge } from "@/components/attendance/connection-badge";
import { SignalIcon } from "@/components/attendance/signal-icon";
import { LiveDuration } from "@/components/attendance/live-duration";
import { useSessions, useSessionStats, useWifiStore } from "@/stores/wifi-store";
import { cn, getInitials } from "@/lib/utils";
import {
  Search, Users, Wifi, WifiOff, RefreshCw,
  MapPin, Clock, MoreHorizontal, UserPlus, Radio,
} from "lucide-react";
import Link from "next/link";

type FilterKey = "all" | "online" | "offline" | "late";

export default function ConnectedUsersPage() {
  const sessions = useSessions();
  const stats = useSessionStats();
  const { connectUser, disconnectUser, signalDrop } = useWifiStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = sessions.filter(s => {
    const matchSearch =
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "online" && s.connectionState === "connected") ||
      (filter === "offline" && s.connectionState === "offline") ||
      (filter === "late" && s.attendanceStatus === "late");
    return matchSearch && matchFilter;
  });

  // Sort: online first, then by name
  const sorted = [...filtered].sort((a, b) => {
    const order = { connected: 0, connecting: 1, reconnecting: 2, disconnecting: 3, offline: 4 };
    const diff = (order[a.connectionState] ?? 5) - (order[b.connectionState] ?? 5);
    return diff !== 0 ? diff : a.userName.localeCompare(b.userName);
  });

  // Online strip — users currently connected
  const onlineNow = sessions.filter(s => s.connectionState === "connected");

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all",     label: "All",     count: stats.total },
    { key: "online",  label: "Online",  count: stats.connected },
    { key: "offline", label: "Offline", count: stats.offline },
    { key: "late",    label: "Late",    count: stats.late },
  ];

  return (
    <DashboardLayout title="Connected Users" subtitle="Real-time WiFi presence & session tracking">

      {/* Online presence strip */}
      <Card className="mb-5 overflow-hidden" padding="none">
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-emerald-50/60 dark:bg-emerald-950/20">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {stats.connected} {stats.connected === 1 ? "user" : "users"} online right now
          </span>
          <Link href="/dashboard/live" className="ml-auto">
            <Button variant="ghost" size="xs" icon={<Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}>
              Live Monitor
            </Button>
          </Link>
        </div>
        {onlineNow.length === 0 ? (
          <div className="px-5 py-4 text-xs text-muted-foreground">
             {`No users connected — go to Live Monitor and click "Connect All" to simulate.`}
          </div>
        ) : (
          <div className="flex gap-4 px-5 py-3 overflow-x-auto scrollbar-thin">
            {onlineNow.map(s => (
              <div key={s.userId} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold",
                    s.avatarColor
                  )}>
                    {getInitials(s.userName)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full w-3 h-3 bg-emerald-500 border-2 border-background" />
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground text-center w-14 truncate">
                  {s.userName.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="none">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {filterTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  filter === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  filter === t.key ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <Input
            placeholder="Search by name, dept, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="flex-1 min-w-[200px]"
          />
          <Button size="sm" icon={<UserPlus className="w-3.5 h-3.5" />}>Add User</Button>
        </div>

        {/* Table header — desktop */}
        <div className="hidden lg:grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2.5 bg-muted/20 border-b border-border text-xs font-medium text-muted-foreground">
          <span>Employee</span>
          <span>Connection</span>
          <span>Attendance</span>
          <span>Check-in</span>
          <span>Duration</span>
          <span>Signal / Location</span>
          <span />
        </div>

        {/* Rows */}
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No users found"
            description="Try adjusting your search or filter."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {sorted.map((session, i) => (
              <motion.div
                key={session.userId}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_auto] gap-2 lg:gap-3 items-center",
                  "px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                  session.connectionState === "connected" && "bg-emerald-50/10 dark:bg-emerald-950/5"
                )}
              >
                {/* Employee */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold",
                      session.avatarColor
                    )}>
                      {getInitials(session.userName)}
                    </div>
                    {session.connectionState === "connected" && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.userName}</p>
                    <p className="text-xs text-muted-foreground">{session.department} · {session.employeeId}</p>
                  </div>
                </div>

                {/* Connection */}
                <div className="hidden lg:block">
                  <ConnectionBadge state={session.connectionState} size="xs" />
                  {session.reconnectCount > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5" />
                      {session.reconnectCount} reconnect{session.reconnectCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Attendance */}
                <div className="hidden lg:block">
                  <AttendanceBadge status={session.attendanceStatus} size="xs" />
                  {session.isLateArrival && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Late arrival</p>
                  )}
                </div>

                {/* Check-in */}
                <div className="hidden lg:block text-xs font-mono-custom text-foreground">
                  {session.checkInTime
                    ? new Date(session.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    : <span className="text-muted-foreground">—</span>}
                </div>

                {/* Duration */}
                <div className="hidden lg:block">
                  <LiveDuration session={session} className="text-xs" pulse />
                </div>

                {/* Signal + Location */}
                <div className="hidden lg:block space-y-1">
                  {session.connectionState !== "offline" ? (
                    <>
                      <SignalIcon dbm={session.signalStrength} showLabel size="sm" />
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        {session.location}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Actions menu */}
                <div className="hidden lg:flex items-center">
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === session.userId ? null : session.userId)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {menuOpen === session.userId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-card-hover w-44 py-1 overflow-hidden"
                          >
                            {session.connectionState === "offline" ? (
                              <button
                                onClick={() => { connectUser(session.userId); setMenuOpen(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted text-left transition-colors"
                              >
                                <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Connect
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => { signalDrop(session.userId); setMenuOpen(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted text-left transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Simulate Signal Drop
                                </button>
                                <button
                                  onClick={() => { disconnectUser(session.userId); setMenuOpen(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted text-left transition-colors text-red-600 dark:text-red-400"
                                >
                                  <WifiOff className="w-3.5 h-3.5" /> Disconnect
                                </button>
                              </>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Mobile summary row */}
                <div className="lg:hidden flex flex-wrap gap-2 items-center">
                  <ConnectionBadge state={session.connectionState} size="xs" />
                  <AttendanceBadge status={session.attendanceStatus} size="xs" />
                  {session.checkInTime && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(session.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  <LiveDuration session={session} className="text-[10px] text-muted-foreground" />
                  {session.connectionState !== "offline" && (
                    <SignalIcon dbm={session.signalStrength} size="sm" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground">
            {sorted.length} of {sessions.length} users
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
            Live — updates automatically
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
