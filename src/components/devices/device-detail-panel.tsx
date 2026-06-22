"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDetectionStore } from "@/stores/detection-store";
import { ThreatBadge, DeviceStatusBadge } from "./threat-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UnauthorizedDevice } from "@/lib/detection-engine/types";
import { X, Wifi, WifiOff, ShieldCheck, Eye, Trash2, UserPlus, Activity, Smartphone, Monitor, Tablet, Cpu, RefreshCw } from "lucide-react";

const deviceIconMap = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  iot: Cpu,
  unknown: Monitor };

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-28">{label}</span>
      <span className={cn("text-xs text-foreground text-right", mono && "font-mono-custom")}>{value}</span>
    </div>
  );
}

interface DeviceDetailPanelProps {
  device: UnauthorizedDevice | null;
  onClose: () => void;
}

export function DeviceDetailPanel({ device, onClose }: DeviceDetailPanelProps) {
  const { blockDevice, approveDevice, monitorDevice, unblockDevice, removeDevice, convertToUser } = useDetectionStore();
  const [showConvert, setShowConvert] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!device) return null;

  const DevIcon = deviceIconMap[device.deviceType] ?? Monitor;

  const handleConvert = () => {
    if (newUserName.trim()) {
      convertToUser(device.id, newUserName.trim());
      setShowConvert(false);
      setNewUserName("");
      onClose();
    }
  };

  const handleRemove = () => {
    if (confirmRemove) {
      removeDevice(device.id);
      onClose();
    } else {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 350, damping: 38 }}
          className="relative bg-card border-l border-border h-full w-full sm:w-[420px] flex flex-col shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className={cn(
            "px-5 pt-5 pb-4 border-b border-border",
            device.threatLevel === "critical" && "bg-red-50/50 dark:bg-red-950/20",
            device.threatLevel === "high" && "bg-orange-50/30 dark:bg-orange-950/10",
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  device.status === "blocked" ? "bg-slate-100 dark:bg-slate-800" :
                  device.threatLevel === "critical" ? "bg-red-100 dark:bg-red-900/50" :
                  device.threatLevel === "high" ? "bg-orange-100 dark:bg-orange-900/50" :
                  "bg-muted"
                )}>
                  <DevIcon className={cn(
                    "w-5 h-5",
                    device.status === "blocked" ? "text-slate-500" :
                    device.threatLevel === "critical" ? "text-red-600 dark:text-red-400" :
                    "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-foreground">{device.deviceName}</h3>
                  <p className="text-xs text-muted-foreground">{device.vendor}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <ThreatBadge level={device.threatLevel} />
              <DeviceStatusBadge status={device.status} />
              {device.isPortScanning && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
                  <Activity className="w-3 h-3" /> Port Scanning
                </span>
              )}
              {device.isHighFrequency && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400">
                  <RefreshCw className="w-3 h-3" /> High Frequency
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5">
            {/* Network info */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Network Info</p>
              <div className="bg-muted/30 rounded-xl p-3">
                <InfoRow label="IP Address"    value={device.ipAddress}    mono />
                <InfoRow label="MAC Address"   value={device.macAddress}   mono />
                <InfoRow label="SSID"          value={device.ssid} />
                <InfoRow label="Signal"        value={`${device.signalStrength} dBm`} mono />
                <InfoRow label="Vendor"        value={device.vendor} />
              </div>
            </div>

            {/* Device info */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Device Info</p>
              <div className="bg-muted/30 rounded-xl p-3">
                <InfoRow label="Device Name"   value={device.deviceName} />
                <InfoRow label="Device Type"   value={<span className="capitalize">{device.deviceType}</span>} />
                <InfoRow label="Operating Sys" value={device.os} />
                <InfoRow label="Attempts"      value={<span className="font-semibold text-red-600 dark:text-red-400">{device.attempts}</span>} />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</p>
              <div className="bg-muted/30 rounded-xl p-3">
                <InfoRow
                  label="First Detected"
                  value={new Date(device.firstDetected).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                />
                <InfoRow
                  label="Last Seen"
                  value={new Date(device.lastSeen).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                />
                {device.blockedAt && (
                  <InfoRow
                    label="Blocked At"
                    value={new Date(device.blockedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  />
                )}
                {device.blockedBy && <InfoRow label="Blocked By" value={device.blockedBy} />}
                {device.approvedBy && <InfoRow label="Approved By" value={device.approvedBy} />}
              </div>
            </div>

            {/* Notes */}
            {device.notes && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">{device.notes}</p>
              </div>
            )}
          </div>

          {/* Actions footer */}
          <div className="border-t border-border px-5 py-4 space-y-3 bg-background/50">
            {/* Convert to user form */}
            <AnimatePresence>
              {showConvert && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/40 rounded-xl p-3 mb-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Register as User</p>
                    <input
                      type="text"
                      placeholder="Enter full name…"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleConvert()}
                      autoFocus
                      className="w-full h-8 bg-background border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex gap-2">
                      <Button size="xs" className="flex-1" onClick={handleConvert} disabled={!newUserName.trim()}>
                        Create User
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => setShowConvert(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              {device.status === "blocked" ? (
                <Button variant="outline" size="sm" icon={<Wifi className="w-3.5 h-3.5 text-emerald-500" />}
                  onClick={() => unblockDevice(device.id)} className="col-span-1">
                  Unblock
                </Button>
              ) : (
                <Button variant="danger" size="sm" icon={<WifiOff className="w-3.5 h-3.5" />}
                  onClick={() => blockDevice(device.id)} className="col-span-1">
                  Block Device
                </Button>
              )}

              {device.status !== "approved" && (
                <Button variant="outline" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                  onClick={() => approveDevice(device.id)}>
                  Approve
                </Button>
              )}

              {device.status !== "monitoring" && (
                <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5 text-blue-500" />}
                  onClick={() => monitorDevice(device.id)}>
                  Monitor
                </Button>
              )}

              <Button variant="outline" size="sm" icon={<UserPlus className="w-3.5 h-3.5 text-violet-500" />}
                onClick={() => setShowConvert(s => !s)}>
                Convert User
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleRemove}
                className={cn(
                  "col-span-2",
                  confirmRemove
                    ? "text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100"
                    : "text-muted-foreground"
                )}
              >
                {confirmRemove ? "Click again to confirm removal" : "Remove from List"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
