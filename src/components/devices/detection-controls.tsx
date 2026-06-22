"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useDetectionStore, useDetectionStats } from "@/stores/detection-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Pause, Zap, Settings, Radio, ShieldAlert, Shield, Eye, ShieldCheck } from "lucide-react";

export function DetectionControls() {
  const { isAutoRunning, simulationSpeedMs, startAuto, stopAuto, triggerNewDevice, setSpeed } = useDetectionStore();
  const stats = useDetectionStats();
  const [showSettings, setShowSettings] = useState(false);

  const speeds = [
    { label: "Slow (10s)",  value: 10000 },
    { label: "Normal (6s)", value: 6000 },
    { label: "Fast (3s)",   value: 3000 },
    { label: "Rapid (1.5s)", value: 1500 },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center",
          isAutoRunning ? "bg-red-50 dark:bg-red-950/40" : "bg-muted"
        )}>
          <Radio className={cn("w-3.5 h-3.5", isAutoRunning ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold font-display">Threat Simulator</p>
          <p className="text-[10px] text-muted-foreground">
            {isAutoRunning ? "Auto-detecting threats…" : "Manual mode — click to inject"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant={isAutoRunning ? "danger" : "outline"}
            size="sm"
            icon={isAutoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={isAutoRunning ? stopAuto : startAuto}
          >
            {isAutoRunning ? "Stop" : "Auto Detect"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(s => !s)}
            className={showSettings ? "bg-accent" : ""}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {[
          { label: "Active",    value: stats.active,    icon: ShieldAlert, color: "text-red-600 dark:text-red-400" },
          { label: "Blocked",   value: stats.blocked,   icon: Shield,      color: "text-slate-500" },
          { label: "Watching",  value: stats.monitoring, icon: Eye,        color: "text-blue-600 dark:text-blue-400" },
          { label: "Approved",  value: stats.approved,  icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center py-2.5">
              <motion.span
                key={s.value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn("text-lg font-bold font-display tabular-nums", s.color)}
              >
                {s.value}
              </motion.span>
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <Icon className="w-2.5 h-2.5" />
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Manual inject */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Button variant="outline" size="sm" icon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
          onClick={triggerNewDevice} className="flex-1">
          Inject Unknown Device
        </Button>
        {stats.critical > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 rounded-lg">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{stats.critical} critical</span>
          </div>
        )}
      </div>

      {/* Speed settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 bg-muted/20">
              <p className="text-xs font-semibold text-foreground mb-2">Detection Speed</p>
              <div className="flex flex-wrap gap-1.5">
                {speeds.map(s => (
                  <button key={s.value} onClick={() => setSpeed(s.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                      simulationSpeedMs === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    )}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
