"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWifiStore, useIsAutoRunning, useWifiConfig, useSessionStats } from "@/stores/wifi-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Play, Pause, Wifi, WifiOff, Settings, RefreshCw, Radio } from "lucide-react";

export function SimulatorControls() {
  const isAutoRunning = useIsAutoRunning();
  const config = useWifiConfig();
  const stats = useSessionStats();
  const { startAuto, stopAuto, connectAll, disconnectAll, updateConfig } = useWifiStore();
  const [showSettings, setShowSettings] = useState(false);

  const speedOptions = [
    { label: "Slow (8s)", value: 8000 },
    { label: "Normal (4s)", value: 4000 },
    { label: "Fast (2s)", value: 2000 },
    { label: "Rapid (1s)", value: 1000 },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            isAutoRunning ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-muted"
          )}>
            <Radio className={cn("w-3.5 h-3.5", isAutoRunning ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="text-sm font-semibold font-display text-foreground">WiFi Simulator</p>
            <p className="text-[10px] text-muted-foreground">
              {isAutoRunning ? `Auto-simulating · ${config.networkSSID}` : "Manual control mode"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Auto toggle */}
          <Button
            variant={isAutoRunning ? "primary" : "outline"}
            size="sm"
            icon={isAutoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={isAutoRunning ? stopAuto : startAuto}
          >
            {isAutoRunning ? "Pause" : "Auto Run"}
          </Button>

          {/* Settings toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(s => !s)}
            className={showSettings ? "bg-accent" : ""}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Live stats strip */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {[
          { label: "Online",      value: stats.connected,    color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Checked In",  value: stats.checkedIn,    color: "text-primary" },
          { label: "Late",        value: stats.late,         color: "text-amber-600 dark:text-amber-400" },
          { label: "Offline",     value: stats.offline,      color: "text-muted-foreground" },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center py-2.5 px-2">
            <span className={cn("text-xl font-bold font-display tabular-nums", stat.color)}>
              {stat.value}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Manual controls */}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        <Button variant="outline" size="sm" icon={<Wifi className="w-3.5 h-3.5 text-emerald-500" />} onClick={connectAll}>
          Connect All
        </Button>
        <Button variant="outline" size="sm" icon={<WifiOff className="w-3.5 h-3.5 text-red-500" />} onClick={disconnectAll}>
          Disconnect All
        </Button>
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5 text-amber-500" />}
          onClick={() => {
            disconnectAll();
            setTimeout(() => connectAll(), 800);
          }}>
          Simulate Outage
        </Button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-3 bg-muted/20">
              <p className="text-xs font-semibold text-foreground">Simulation Speed</p>
              <div className="flex flex-wrap gap-2">
                {speedOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateConfig({ simulationSpeedMs: opt.value })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      config.simulationSpeedMs === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Work Start</p>
                  <div className="flex gap-1.5">
                    {[8, 9, 10].map(h => (
                      <button key={h}
                        onClick={() => updateConfig({ workStartHour: h })}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-xs font-medium border transition-all",
                          config.workStartHour === h
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}>
                        {h}:00
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Late After</p>
                  <div className="flex gap-1.5">
                    {[0, 15, 30].map(m => (
                      <button key={m}
                        onClick={() => updateConfig({ lateThresholdMinutes: m })}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-xs font-medium border transition-all",
                          config.lateThresholdMinutes === m
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}>
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground border-t border-border pt-2 mt-1">
                SSID: <span className="font-mono-custom text-foreground">{config.networkSSID}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
