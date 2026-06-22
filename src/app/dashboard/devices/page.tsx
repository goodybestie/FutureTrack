"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { DetectionEngineProvider } from "@/components/providers/detection-engine-provider";
import { DetectionControls } from "@/components/devices/detection-controls";
import { DeviceTable } from "@/components/devices/device-table";
import { DeviceDetailPanel } from "@/components/devices/device-detail-panel";
import { DetectionEventFeed } from "@/components/devices/detection-event-feed";
import { ThreatNetworkMap } from "@/components/devices/threat-network-map";
import { ToastContainer } from "@/components/devices/toast-container";
import { ThreatBadge } from "@/components/devices/threat-badge";
import { useDetectionStore, useDetectionStats } from "@/stores/detection-store";
import { cn } from "@/lib/utils";
import type { UnauthorizedDevice } from "@/lib/detection-engine/types";
import { ShieldAlert, Shield, Eye, ShieldCheck, Activity, BarChart3 } from "lucide-react";

function StatPill({
  label, value, icon: Icon, color, bg, index }: {
  label: string; value: number | string;
  icon: React.ElementType; color: string; bg: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("w-4.5 h-4.5", color)} />
      </div>
      <div>
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-2xl font-bold font-display tabular-nums leading-none", color)}
        >
          {value}
        </motion.p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function DevicesPageContent() {
  const [selectedDevice, setSelectedDevice] = useState<UnauthorizedDevice | null>(null);
  const [activeTab, setActiveTab] = useState<"table" | "map">("table");
  const stats = useDetectionStats();
  const { devices } = useDetectionStore();

  // Auto-select newly detected critical devices for visibility
  useEffect(() => {
    const critical = devices.find(d => d.threatLevel === "critical" && d.status === "active");
    if (critical && !selectedDevice) {
      // Don't auto-open panel — just flash the row (handled by isNew in table)
    }
  }, [devices, selectedDevice]);

  const tabs = [
    { key: "table" as const, label: "Device Table",  icon: BarChart3 },
    { key: "map"   as const, label: "Network Map",   icon: Activity },
  ];

  return (
    <>
      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatPill index={0} label="Active Threats" value={stats.active}
          icon={ShieldAlert} color="text-red-600 dark:text-red-400" bg="bg-red-50 dark:bg-red-950/40" />
        <StatPill index={1} label="Blocked" value={stats.blocked}
          icon={Shield} color="text-slate-600 dark:text-slate-400" bg="bg-slate-100 dark:bg-slate-800/50" />
        <StatPill index={2} label="Monitoring" value={stats.monitoring}
          icon={Eye} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
        <StatPill index={3} label="Approved" value={stats.approved}
          icon={ShieldCheck} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
      </div>

      {/* Critical threat alert banner */}
      {stats.critical > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl mb-5"
        >
          <span className="flex w-3 h-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <p className="text-sm text-red-700 dark:text-red-300 font-medium flex-1">
            <span className="font-bold">{stats.critical} critical threat{stats.critical > 1 ? "s" : ""}</span>
            {" "}actively compromising your network — immediate action required
          </p>
          <ThreatBadge level="critical" size="xs" />
        </motion.div>
      )}

      {/* Simulator controls */}
      <div className="mb-5">
        <DetectionControls />
      </div>

      {/* Main content: left table/map + right feed + map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left — table or network map */}
        <div className="xl:col-span-2 space-y-4">
          {/* Tab switcher */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    activeTab === t.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              {stats.active + stats.blocked + stats.monitoring + stats.approved} total devices detected
            </span>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "table" ? (
              <Card padding="none">
                <DeviceTable onSelectDevice={setSelectedDevice} />
              </Card>
            ) : (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <h3 className="text-sm font-semibold font-display">Network Threat Map</h3>
                  <span className="text-xs text-muted-foreground">
                    Showing up to 12 devices · click to inspect
                  </span>
                </div>
                <ThreatNetworkMap onSelectDevice={setSelectedDevice} />
              </Card>
            )}
          </motion.div>
        </div>

        {/* Right — event feed */}
        <div className="space-y-4">
          {/* Quick stats card */}
          <Card padding="sm">
            <p className="text-xs font-semibold font-display mb-3">Threat Breakdown</p>
            {(["critical", "high", "medium", "low"] as const).map(level => {
              const count = devices.filter(d => d.threatLevel === level).length;
              const pct = devices.length > 0 ? (count / devices.length) * 100 : 0;
              const colors = {
                critical: "bg-red-500",
                high:     "bg-orange-500",
                medium:   "bg-amber-500",
                low:      "bg-slate-400" };
              return (
                <div key={level} className="mb-2.5 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize text-muted-foreground">{level}</span>
                    <span className="text-xs font-bold tabular-nums text-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", colors[level])}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Detection event feed */}
          <Card padding="none" className="sticky top-4">
            <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-semibold font-display">Detection Feed</h3>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <DetectionEventFeed maxHeight="calc(100vh - 420px)" />
          </Card>
        </div>
      </div>

      {/* Device detail side panel */}
      {selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </>
  );
}

export default function DevicesPage() {
  return (
    <DashboardLayout title="Unauthorized Devices" subtitle="Real-time threat detection & network security monitoring">
      <DetectionEngineProvider>
        <DevicesPageContent />
      </DetectionEngineProvider>
    </DashboardLayout>
  );
}
