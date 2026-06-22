"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUnauthorizedDevices, useDetectionStore } from "@/stores/detection-store";
import { ThreatBadge, DeviceStatusBadge } from "./threat-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { UnauthorizedDevice, DeviceStatus, ThreatLevel } from "@/lib/detection-engine/types";
import { Search, Shield, ShieldAlert, ShieldCheck, Eye, Smartphone, Monitor, Tablet, Cpu, ChevronUp, ChevronDown, MoreHorizontal, Ban, Trash2, RefreshCw, Activity } from "lucide-react";

const deviceIcons = {
  mobile: Smartphone, tablet: Tablet, desktop: Monitor,
  iot: Cpu, unknown: Monitor };

const threatOrder: Record<ThreatLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const statusOrder: Record<DeviceStatus, number> = { active: 0, monitoring: 1, blocked: 2, approved: 3 };

type SortKey = "deviceName" | "threatLevel" | "status" | "attempts" | "firstDetected" | "lastSeen";

interface DeviceRowProps {
  device: UnauthorizedDevice;
  isNew: boolean;
  onSelect: (d: UnauthorizedDevice) => void;
}

function DeviceRow({ device, isNew, onSelect }: DeviceRowProps) {
  const { blockDevice, approveDevice, monitorDevice, removeDevice } = useDetectionStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = deviceIcons[device.deviceType] ?? Monitor;

  const rowBg =
    device.threatLevel === "critical" ? "bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/60 dark:hover:bg-red-950/20" :
    device.threatLevel === "high"     ? "bg-orange-50/30 dark:bg-orange-950/5 hover:bg-orange-50/50" :
    "hover:bg-muted/20";

  return (
    <motion.tr
      layout
      initial={isNew ? { opacity: 0, backgroundColor: "hsl(var(--primary) / 0.06)" } : { opacity: 1 }}
      animate={{ opacity: 1, backgroundColor: "transparent" }}
      transition={{ duration: 0.4 }}
      className={cn("transition-colors cursor-pointer group", rowBg)}
      onClick={() => onSelect(device)}
    >
      {/* Device name + icon */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            device.status === "blocked" ? "bg-slate-100 dark:bg-slate-800" :
            device.threatLevel === "critical" ? "bg-red-100 dark:bg-red-900/50" :
            device.threatLevel === "high" ? "bg-orange-100 dark:bg-orange-900/50" :
            "bg-muted"
          )}>
            <Icon className={cn("w-4 h-4",
              device.status === "blocked" ? "text-slate-400" :
              device.threatLevel === "critical" ? "text-red-600 dark:text-red-400" :
              "text-muted-foreground"
            )} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground truncate">{device.deviceName}</p>
              {device.isPortScanning && (
                <span title="Port scanning">
                  <Activity className="w-3 h-3 text-red-500 shrink-0" />
                </span>
              )}
              {device.isHighFrequency && (
                <span title="High frequency">
                  <RefreshCw className="w-3 h-3 text-orange-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{device.vendor} · {device.os}</p>
          </div>
        </div>
      </td>

      {/* IP + MAC */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <p className="text-xs font-mono-custom text-foreground">{device.ipAddress}</p>
        <p className="text-[10px] font-mono-custom text-muted-foreground">{device.macAddress}</p>
      </td>

      {/* Threat */}
      <td className="px-4 py-3 hidden md:table-cell">
        <ThreatBadge level={device.threatLevel} size="xs" />
      </td>

      {/* Status */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <DeviceStatusBadge status={device.status} size="xs" />
      </td>

      {/* Attempts */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className={cn(
          "text-sm font-bold tabular-nums",
          device.attempts > 15 ? "text-red-600 dark:text-red-400" :
          device.attempts > 5  ? "text-amber-600 dark:text-amber-400" :
          "text-foreground"
        )}>
          {device.attempts}
        </span>
      </td>

      {/* First detected */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <p className="text-xs text-muted-foreground">
          {new Date(device.firstDetected).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          {new Date(device.firstDetected).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          {/* Quick actions — visible on hover */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {device.status !== "blocked" ? (
              <Button variant="ghost" size="xs"
                icon={<Ban className="w-3 h-3 text-red-500" />}
                onClick={() => blockDevice(device.id)}
                title="Block"
                className="h-7 w-7 p-0"
              />
            ) : (
              <Button variant="ghost" size="xs"
                icon={<ShieldCheck className="w-3 h-3 text-emerald-500" />}
                onClick={() => approveDevice(device.id)}
                title="Approve"
                className="h-7 w-7 p-0"
              />
            )}
            {device.status !== "monitoring" && (
              <Button variant="ghost" size="xs"
                icon={<Eye className="w-3 h-3 text-blue-500" />}
                onClick={() => monitorDevice(device.id)}
                title="Monitor"
                className="h-7 w-7 p-0"
              />
            )}
          </div>

          {/* More menu */}
          <div className="relative">
            <Button variant="ghost" size="xs" className="h-7 w-7 p-0"
              onClick={() => setMenuOpen(s => !s)}>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-8 z-30 bg-card border border-border rounded-xl shadow-card-hover w-44 py-1 overflow-hidden"
                  >
                    <button onClick={() => { onSelect(device); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left">
                      <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" /> View Details
                    </button>
                    {device.status !== "blocked" ? (
                      <button onClick={() => { blockDevice(device.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left text-red-600 dark:text-red-400">
                        <Ban className="w-3.5 h-3.5" /> Block Device
                      </button>
                    ) : (
                      <button onClick={() => { approveDevice(device.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Approve Device
                      </button>
                    )}
                    <button onClick={() => { monitorDevice(device.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left text-blue-600 dark:text-blue-400">
                      <Eye className="w-3.5 h-3.5" /> Start Monitoring
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => { removeDevice(device.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left text-muted-foreground">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

interface DeviceTableProps {
  onSelectDevice: (d: UnauthorizedDevice) => void;
}

export function DeviceTable({ onSelectDevice }: DeviceTableProps) {
  const devices = useUnauthorizedDevices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">("all");
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("threatLevel");
  const [sortAsc, setSortAsc] = useState(true);
  const prevCountRef = useState(() => devices.length)[0];

  const filtered = devices.filter(d => {
    const matchSearch =
      d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      d.ipAddress.includes(search) ||
      d.macAddress.toLowerCase().includes(search.toLowerCase()) ||
      d.os.toLowerCase().includes(search.toLowerCase()) ||
      d.vendor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchThreat = threatFilter === "all" || d.threatLevel === threatFilter;
    return matchSearch && matchStatus && matchThreat;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "threatLevel") cmp = (threatOrder[a.threatLevel] ?? 4) - (threatOrder[b.threatLevel] ?? 4);
    else if (sortKey === "status")  cmp = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
    else if (sortKey === "deviceName") cmp = a.deviceName.localeCompare(b.deviceName);
    else if (sortKey === "attempts") cmp = a.attempts - b.attempts;
    else if (sortKey === "firstDetected") cmp = new Date(a.firstDetected).getTime() - new Date(b.firstDetected).getTime();
    else if (sortKey === "lastSeen") cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
    return sortAsc ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(s => !s);
    else { setSortKey(key); setSortAsc(true); }
  }

  const SortHeader = ({ col, label, className = "" }: { col: SortKey; label: string; className?: string }) => (
    <button onClick={() => toggleSort(col)}
      className={cn("flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors", className)}>
      {label}
      {sortKey === col
        ? sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
        : <ChevronUp className="w-3 h-3 opacity-20" />}
    </button>
  );

  const newDevices = devices.slice(0, Math.max(0, devices.length - prevCountRef));

  const statusTabs: { key: DeviceStatus | "all"; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: devices.length },
    { key: "active",    label: "Active",    count: devices.filter(d => d.status === "active").length },
    { key: "blocked",   label: "Blocked",   count: devices.filter(d => d.status === "blocked").length },
    { key: "monitoring",label: "Monitoring",count: devices.filter(d => d.status === "monitoring").length },
    { key: "approved",  label: "Approved",  count: devices.filter(d => d.status === "approved").length },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        {/* Status tabs */}
        <div className="flex gap-1 p-0.5 bg-muted rounded-lg overflow-x-auto">
          {statusTabs.map(t => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                statusFilter === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              {t.label}
              <span className={cn("px-1 py-0.5 rounded-full text-[9px] font-bold",
                statusFilter === t.key ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"
              )}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Threat level filter */}
        <select
          value={threatFilter}
          onChange={e => setThreatFilter(e.target.value as ThreatLevel | "all")}
          className="h-8 bg-background border border-border rounded-lg px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Threats</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <Input placeholder="Search device, IP, MAC, OS…" value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="flex-1 min-w-[180px]" />
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-6 h-6" />}
          title={statusFilter === "all" ? "No unauthorized devices detected" : `No ${statusFilter} devices`}
          description="Your network looks clean right now."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left"><SortHeader col="deviceName" label="Device" /></th>
                <th className="px-4 py-2.5 text-left hidden sm:table-cell">
                  <span className="text-xs font-medium text-muted-foreground">IP / MAC</span>
                </th>
                <th className="px-4 py-2.5 text-left hidden md:table-cell"><SortHeader col="threatLevel" label="Threat" /></th>
                <th className="px-4 py-2.5 text-left hidden lg:table-cell"><SortHeader col="status" label="Status" /></th>
                <th className="px-4 py-2.5 text-left hidden md:table-cell"><SortHeader col="attempts" label="Attempts" /></th>
                <th className="px-4 py-2.5 text-left hidden xl:table-cell"><SortHeader col="firstDetected" label="Detected" /></th>
                <th className="px-4 py-2.5 text-right">
                  <span className="text-xs font-medium text-muted-foreground">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {sorted.map((device, i) => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    isNew={i < Math.max(0, devices.length - prevCountRef)}
                    onSelect={onSelectDevice}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/5">
        <p className="text-xs text-muted-foreground">{sorted.length} of {devices.length} devices</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Live monitoring active
        </div>
      </div>
    </div>
  );
}
