"use client";

import { useUnauthorizedDevices } from "@/stores/detection-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UnauthorizedDevice } from "@/lib/detection-engine/types";
import { Smartphone, Monitor, Tablet, Cpu, Shield, Wifi } from "lucide-react";

const deviceIcons = {
  mobile: Smartphone, tablet: Tablet, desktop: Monitor,
  iot: Cpu, unknown: Monitor,
};

const threatColors = {
  critical: { node: "bg-red-500 shadow-red-500/50",    ring: "border-red-400",    pulse: "bg-red-400",    line: "#ef4444" },
  high:     { node: "bg-orange-500 shadow-orange-500/40", ring: "border-orange-400", pulse: "bg-orange-400", line: "#f97316" },
  medium:   { node: "bg-amber-500 shadow-amber-400/30", ring: "border-amber-400",  pulse: "bg-amber-400",  line: "#f59e0b" },
  low:      { node: "bg-slate-400",                     ring: "border-slate-300",  pulse: "bg-slate-300",  line: "#94a3b8" },
};

// Fixed positions around a central router node
const POSITIONS = [
  { x: 50, y: 15 },  { x: 80, y: 28 },  { x: 92, y: 55 },
  { x: 80, y: 78 },  { x: 55, y: 88 },  { x: 25, y: 78 },
  { x: 10, y: 55 },  { x: 20, y: 28 },  { x: 62, y: 35 },
  { x: 38, y: 35 },  { x: 70, y: 65 },  { x: 30, y: 65 },
];

function DeviceNode({
  device,
  position,
  index,
  onClick,
}: {
  device: UnauthorizedDevice;
  position: { x: number; y: number };
  index: number;
  onClick: () => void;
}) {
  const cfg = threatColors[device.threatLevel];
  const Icon = deviceIcons[device.deviceType] ?? Monitor;
  const isActive = device.status === "active";
  const isBlocked = device.status === "blocked";

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Connection line to center */}
      <motion.line
        x1={`${position.x}%`} y1={`${position.y}%`}
        x2="50%" y2="50%"
        stroke={isBlocked ? "#94a3b8" : cfg.line}
        strokeWidth={isBlocked ? "0.5" : device.threatLevel === "critical" ? "1.5" : "1"}
        strokeOpacity={isBlocked ? "0.2" : "0.4"}
        strokeDasharray={isBlocked ? "3,3" : device.threatLevel === "critical" ? "none" : "4,4"}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: index * 0.05 }}
      />

      {/* Pulse rings for critical/high — animate-ping via SVG animation */}
      {isActive && (device.threatLevel === "critical" || device.threatLevel === "high") && (
        <>
          <circle
            cx={`${position.x}%`} cy={`${position.y}%`} r="16"
            fill="none" stroke={cfg.line} strokeWidth="1" opacity="0"
            className="animate-ping"
          >
            <animate attributeName="r" values="10;22" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Node circle */}
      <foreignObject
        x={`${position.x}%`} y={`${position.y}%`}
        width="1" height="1"
        overflow="visible"
        style={{ transform: "translate(-14px, -14px)" }}
      >
        <div
          onClick={onClick}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center cursor-pointer",
            "border-2 shadow-lg transition-transform hover:scale-110",
            isBlocked ? "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" : cfg.node,
            cfg.ring,
            isActive && "shadow-md"
          )}
          title={`${device.deviceName} · ${device.ipAddress}`}
        >
          <Icon className={cn("w-3 h-3", isBlocked ? "text-slate-400" : "text-white")} />
        </div>
      </foreignObject>

      {/* Label */}
      <text
        x={`${position.x}%`}
        y={`${position.y}%`}
        dy="24"
        textAnchor="middle"
        className="fill-current text-muted-foreground"
        style={{ fontSize: "8px", fontFamily: "var(--font-mono)" }}
      >
        {device.ipAddress}
      </text>
    </motion.g>
  );
}

interface ThreatNetworkMapProps {
  onSelectDevice: (device: UnauthorizedDevice) => void;
}

export function ThreatNetworkMap({ onSelectDevice }: ThreatNetworkMapProps) {
  const devices = useUnauthorizedDevices();
  const activeDevices = devices.slice(0, 12); // show up to 12 on map

  const criticalCount = devices.filter(d => d.threatLevel === "critical").length;
  const activeCount = devices.filter(d => d.status === "active").length;

  return (
    <div className="relative w-full">
      {/* SVG map */}
      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height: "280px" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.15" className="text-border" />
          </pattern>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill="url(#grid)" />

        {/* Center glow */}
        <circle cx="50" cy="50" r="30" fill="url(#centerGlow)" />

        {/* Outer ring */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor"
          strokeWidth="0.3" strokeOpacity="0.15" strokeDasharray="2,3" className="text-border" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor"
          strokeWidth="0.2" strokeOpacity="0.1" className="text-border" />

        {/* Device nodes */}
        {activeDevices.map((device, i) => (
          <DeviceNode
            key={device.id}
            device={device}
            position={POSITIONS[i] ?? { x: 50, y: 50 }}
            index={i}
            onClick={() => onSelectDevice(device)}
          />
        ))}

        {/* Central router node */}
        <foreignObject x="50%" y="50%" width="1" height="1" overflow="visible"
          style={{ transform: "translate(-18px, -18px)" }}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/60">
            <Wifi className="w-4 h-4 text-white" />
          </div>
        </foreignObject>
        <text x="50%" y="50%" dy="28" textAnchor="middle"
          style={{ fontSize: "6px", fontFamily: "var(--font-mono)", fill: "hsl(var(--primary))", fontWeight: 600 }}>
          ROUTER
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {(["critical", "high", "medium", "low"] as const).map(level => (
          <div key={level} className="flex items-center gap-1.5">
            <span className={cn("w-2.5 h-2.5 rounded-full", threatColors[level].node)} />
            <span className="text-[10px] text-muted-foreground capitalize">{level}</span>
          </div>
        ))}
      </div>

      {/* Overlay stats */}
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg"
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {criticalCount} CRITICAL
        </motion.div>
      )}

      {activeDevices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Network clear</p>
          </div>
        </div>
      )}
    </div>
  );
}
