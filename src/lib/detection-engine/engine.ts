// ═══════════════════════════════════════════════════════════════
//  FutureTrack — Unauthorized Device Detection Engine
//  Simulates realistic network intrusion detection behavior.
// ═══════════════════════════════════════════════════════════════

import type {
  UnauthorizedDevice, DetectionEvent, ToastNotification,
  ThreatLevel, DeviceType, DeviceStatus,
  DetectionStats,
} from "./types";
import {
  DEVICE_NAME_POOL, OS_POOL, VENDOR_POOL, THREAT_MESSAGES,
} from "./types";

// ── Helpers ──────────────────────────────────────────────────

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIP(): string {
  // Mix of subnet ranges to simulate different network zones
  const subnets = ["192.168.1", "192.168.2", "10.0.1", "172.16.0"];
  return `${randomItem(subnets)}.${Math.floor(Math.random() * 240) + 10}`;
}

function generateMAC(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()
  ).join(":");
}

function generateSignal(): number {
  // Unknown devices often have weaker or erratic signals
  return -(Math.floor(Math.random() * 40) + 55); // -55 to -95
}

function assessThreatLevel(device: Partial<UnauthorizedDevice>): ThreatLevel {
  const attempts = device.attempts ?? 1;
  if (device.isPortScanning || device.isSpoofingSuspected) return "critical";
  if (device.isHighFrequency || attempts > 15) return "high";
  if (attempts > 5) return "medium";
  return "low";
}

function inferDeviceType(name: string, os: string): DeviceType {
  const n = name.toLowerCase();
  const o = os.toLowerCase();
  if (n.includes("iphone") || n.includes("android") || n.includes("pixel") ||
      n.includes("oneplus") || n.includes("samsung") || o.includes("ios") || o.includes("android"))
    return "mobile";
  if (n.includes("tab") || n.includes("ipad") || n.includes("surface"))
    return "tablet";
  if (n.includes("esp") || n.includes("iot") || n.includes("pi") || n.includes("extender"))
    return "iot";
  return "desktop";
}

function makeThreatMessage(level: ThreatLevel): string {
  return randomItem(THREAT_MESSAGES[level]);
}

// ── Pub/Sub callback types ────────────────────────────────────

export type DeviceCallback = (
  devices: UnauthorizedDevice[],
  events: DetectionEvent[],
  toasts: ToastNotification[]
) => void;

// ── Detection Engine Class ────────────────────────────────────

export class UnauthorizedDeviceEngine {
  private devices: Map<string, UnauthorizedDevice> = new Map();
  private eventLog: DetectionEvent[] = [];
  private pendingToasts: ToastNotification[] = [];
  private subscribers: Set<DeviceCallback> = new Set();
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private escalationTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Config
  private simulationSpeedMs: number;
  private networkSSID: string;

  constructor(speedMs = 6000, ssid = "FutureTrack-Corp-5GHz") {
    this.simulationSpeedMs = speedMs;
    this.networkSSID = ssid;
    this.seedInitialDevices();
  }

  // ── Boot seed ─────────────────────────────────────────────

  private seedInitialDevices() {
    // Pre-populate with 3 realistic initial threats
    const seeds: Partial<UnauthorizedDevice>[] = [
      {
        deviceName: "UNKNOWN-ANDROID",
        os: "Android 12",
        attempts: 7,
        isPortScanning: false,
        isHighFrequency: false,
        isSpoofingSuspected: false,
        status: "active",
      },
      {
        deviceName: "Kali-Linux-Box",
        os: "Kali Linux 2023",
        attempts: 23,
        isPortScanning: true,
        isHighFrequency: true,
        isSpoofingSuspected: false,
        status: "active",
      },
      {
        deviceName: "RaspberryPi-4B",
        os: "Raspberry Pi OS",
        attempts: 3,
        isPortScanning: false,
        isHighFrequency: false,
        isSpoofingSuspected: false,
        status: "monitoring",
      },
    ];

    seeds.forEach((seed, i) => {
      const now = new Date();
      const firstDetected = new Date(now.getTime() - (seeds.length - i) * 15 * 60 * 1000);
      const os = seed.os!;
      const name = seed.deviceName!;
      const vendor = randomItem(VENDOR_POOL);
      const isPortScanning = seed.isPortScanning ?? false;
      const isHighFrequency = seed.isHighFrequency ?? false;
      const attempts = seed.attempts ?? 1;
      const isSpoofingSuspected = seed.isSpoofingSuspected ?? false;

      const partial = { isPortScanning, isHighFrequency, isSpoofingSuspected, attempts };
      const threatLevel = assessThreatLevel(partial);

      const device: UnauthorizedDevice = {
        id: uid(),
        deviceName: name,
        deviceType: inferDeviceType(name, os),
        ipAddress: generateIP(),
        macAddress: generateMAC(),
        os,
        vendor,
        ssid: this.networkSSID,
        signalStrength: generateSignal(),
        firstDetected,
        lastSeen: new Date(now.getTime() - i * 2 * 60 * 1000),
        attempts,
        status: seed.status as DeviceStatus,
        threatLevel,
        isPortScanning,
        isHighFrequency,
        isSpoofingSuspected,
      };

      this.devices.set(device.id, device);

      // Seed event
      this.pushEvent({
        deviceId: device.id,
        deviceName: device.deviceName,
        type: "NEW_DEVICE",
        severity: threatLevel === "critical" ? "critical" : "warning",
        message: `${device.deviceName} detected on ${this.networkSSID} — ${makeThreatMessage(threatLevel)}`,
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
        metadata: { threatLevel, attempts },
      }, device.firstDetected);
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────

  startAutoDetection() {
    if (this.autoTimer) return;
    this.autoTimer = setInterval(() => this.tick(), this.simulationSpeedMs);
  }

  stopAutoDetection() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  destroy() {
    this.stopAutoDetection();
    this.escalationTimers.forEach(t => clearTimeout(t));
    this.escalationTimers.clear();
    this.subscribers.clear();
  }

  updateSpeed(ms: number) {
    this.simulationSpeedMs = ms;
    if (this.autoTimer) {
      this.stopAutoDetection();
      this.startAutoDetection();
    }
  }

  // ── Pub/Sub ───────────────────────────────────────────────

  subscribe(cb: DeviceCallback): () => void {
    this.subscribers.add(cb);
    cb(this.getDeviceArray(), [], []);
    return () => this.subscribers.delete(cb);
  }

  private emit(newEvents: DetectionEvent[] = [], newToasts: ToastNotification[] = []) {
    const devices = this.getDeviceArray();
    this.subscribers.forEach(cb => cb(devices, newEvents, newToasts));
    // Clear consumed toasts
    this.pendingToasts = [];
  }

  // ── Auto tick — generates realistic detection events ─────

  private tick() {
    const roll = Math.random();

    if (roll < 0.45) {
      // New unknown device appears
      this.simulateNewDevice();
    } else if (roll < 0.72) {
      // Existing active device escalates behavior
      this.simulateEscalation();
    } else if (roll < 0.88) {
      // Reconnect attempt from blocked device
      this.simulateBlockedAttempt();
    } else {
      // Quiet tick — just update lastSeen on active devices
      this.refreshLastSeen();
    }
  }

  // ── Simulation scenarios ──────────────────────────────────

  simulateNewDevice(): UnauthorizedDevice | null {
    // Cap at 20 active threats for UI clarity
    const activeCount = [...this.devices.values()].filter(d => d.status === "active").length;
    if (activeCount >= 20) return null;

    const name = randomItem(DEVICE_NAME_POOL);
    const os = randomItem(OS_POOL);
    const vendor = randomItem(VENDOR_POOL);
    const isPortScanning = Math.random() < 0.12;
    const isHighFrequency = Math.random() < 0.18;
    const isSpoofingSuspected = Math.random() < 0.08;
    const attempts = Math.floor(Math.random() * 8) + 1;

    const partial = { isPortScanning, isHighFrequency, isSpoofingSuspected, attempts };
    const threatLevel = assessThreatLevel(partial);

    const device: UnauthorizedDevice = {
      id: uid(),
      deviceName: name,
      deviceType: inferDeviceType(name, os),
      ipAddress: generateIP(),
      macAddress: generateMAC(),
      os,
      vendor,
      ssid: this.networkSSID,
      signalStrength: generateSignal(),
      firstDetected: new Date(),
      lastSeen: new Date(),
      attempts,
      status: "active",
      threatLevel,
      isPortScanning,
      isHighFrequency,
      isSpoofingSuspected,
    };

    this.devices.set(device.id, device);

    const evt = this.pushEvent({
      deviceId: device.id,
      deviceName: device.deviceName,
      type: "NEW_DEVICE",
      severity: threatLevel === "critical" ? "critical" : threatLevel === "high" ? "warning" : "warning",
      message: `${device.deviceName} joined ${this.networkSSID} — ${makeThreatMessage(threatLevel)}`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      metadata: { threatLevel, isPortScanning, isHighFrequency },
    });

    const toast = this.makeToast({
      type: threatLevel === "critical" ? "threat" : "warning",
      title: threatLevel === "critical"
        ? "⚠️ Critical Threat Detected"
        : threatLevel === "high"
          ? "🔴 High Risk Device"
          : "Unknown Device Detected",
      message: `${device.deviceName} · ${device.ipAddress} · ${makeThreatMessage(threatLevel)}`,
      deviceId: device.id,
    });

    // Schedule auto-escalation for critical devices
    if (isPortScanning || isHighFrequency) {
      this.scheduleEscalation(device.id);
    }

    this.emit([evt], [toast]);
    return device;
  }

  private simulateEscalation() {
    const active = [...this.devices.values()].filter(
      d => d.status === "active" && d.threatLevel !== "critical"
    );
    if (active.length === 0) return;

    const device = randomItem(active);
    const newAttempts = device.attempts + Math.floor(Math.random() * 5) + 1;
    const isHighFrequency = newAttempts > 10;
    const newThreat = assessThreatLevel({ ...device, attempts: newAttempts, isHighFrequency });

    const updated: UnauthorizedDevice = {
      ...device,
      attempts: newAttempts,
      lastSeen: new Date(),
      isHighFrequency,
      threatLevel: newThreat,
    };
    this.devices.set(device.id, updated);

    const evt = this.pushEvent({
      deviceId: device.id,
      deviceName: device.deviceName,
      type: "RECONNECT_ATTEMPT",
      severity: isHighFrequency ? "critical" : "warning",
      message: `${device.deviceName} — attempt #${newAttempts}${isHighFrequency ? " (high-frequency pattern detected)" : ""}`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      metadata: { attempts: newAttempts, threatLevel: newThreat },
    });

    const toasts: ToastNotification[] = [];
    if (isHighFrequency && !device.isHighFrequency) {
      toasts.push(this.makeToast({
        type: "threat",
        title: "High-Frequency Attack Pattern",
        message: `${device.deviceName} made ${newAttempts} attempts — possible brute-force`,
        deviceId: device.id,
      }));
    }

    this.emit([evt], toasts);
  }

  private simulateBlockedAttempt() {
    const blocked = [...this.devices.values()].filter(d => d.status === "blocked");
    if (blocked.length === 0) return;

    const device = randomItem(blocked);
    const updated = { ...device, attempts: device.attempts + 1, lastSeen: new Date() };
    this.devices.set(device.id, updated);

    const evt = this.pushEvent({
      deviceId: device.id,
      deviceName: device.deviceName,
      type: "BLOCKED_ATTEMPT",
      severity: "warning",
      message: `${device.deviceName} attempted to reconnect — blocked at firewall`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
    });

    this.emit([evt], []);
  }

  private refreshLastSeen() {
    const active = [...this.devices.values()].filter(d => d.status === "active");
    if (active.length === 0) return;
    const device = randomItem(active);
    this.devices.set(device.id, { ...device, lastSeen: new Date() });
    this.emit();
  }

  private scheduleEscalation(deviceId: string) {
    const t = setTimeout(() => {
      const device = this.devices.get(deviceId);
      if (!device || device.status !== "active") return;

      const updated = { ...device, isPortScanning: true, threatLevel: "critical" as ThreatLevel };
      this.devices.set(deviceId, updated);

      const evt = this.pushEvent({
        deviceId,
        deviceName: device.deviceName,
        type: "PORT_SCAN",
        severity: "critical",
        message: `${device.deviceName} — active port scanning detected on internal network!`,
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
      });

      const toast = this.makeToast({
        type: "threat",
        title: "🚨 Port Scan In Progress",
        message: `${device.deviceName} is actively scanning your network`,
        deviceId,
      });

      this.emit([evt], [toast]);
    }, this.simulationSpeedMs * 3);

    this.escalationTimers.set(deviceId, t);
  }

  // ── Manual admin actions ──────────────────────────────────

  blockDevice(deviceId: string, adminName = "Admin"): DetectionEvent | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updated: UnauthorizedDevice = {
      ...device,
      status: "blocked",
      blockedAt: new Date(),
      blockedBy: adminName,
    };
    this.devices.set(deviceId, updated);

    // Clear any escalation timer
    const t = this.escalationTimers.get(deviceId);
    if (t) { clearTimeout(t); this.escalationTimers.delete(deviceId); }

    const evt = this.pushEvent({
      deviceId,
      deviceName: device.deviceName,
      type: "BLOCKED",
      severity: "info",
      message: `${device.deviceName} blocked by ${adminName} — access revoked`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      metadata: { blockedBy: adminName },
    });

    const toast = this.makeToast({
      type: "blocked",
      title: "Device Blocked",
      message: `${device.deviceName} has been blocked from the network`,
      deviceId,
      autoDismiss: true,
    });

    this.emit([evt], [toast]);
    return evt;
  }

  approveDevice(deviceId: string, adminName = "Admin"): DetectionEvent | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updated: UnauthorizedDevice = {
      ...device,
      status: "approved",
      approvedAt: new Date(),
      approvedBy: adminName,
    };
    this.devices.set(deviceId, updated);

    const evt = this.pushEvent({
      deviceId,
      deviceName: device.deviceName,
      type: "APPROVED",
      severity: "info",
      message: `${device.deviceName} approved by ${adminName} — device registered`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
    });

    const toast = this.makeToast({
      type: "approved",
      title: "Device Approved",
      message: `${device.deviceName} has been approved and registered`,
      deviceId,
      autoDismiss: true,
    });

    this.emit([evt], [toast]);
    return evt;
  }

  startMonitoring(deviceId: string): DetectionEvent | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updated = { ...device, status: "monitoring" as DeviceStatus };
    this.devices.set(deviceId, updated);

    const evt = this.pushEvent({
      deviceId,
      deviceName: device.deviceName,
      type: "MONITORING_STARTED",
      severity: "info",
      message: `${device.deviceName} placed under enhanced monitoring`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
    });

    const toast = this.makeToast({
      type: "info",
      title: "Monitoring Started",
      message: `${device.deviceName} is now under observation`,
      deviceId,
      autoDismiss: true,
    });

    this.emit([evt], [toast]);
    return evt;
  }

  unblockDevice(deviceId: string): DetectionEvent | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updated: UnauthorizedDevice = {
      ...device,
      status: "active",
      blockedAt: undefined,
      blockedBy: undefined,
    };
    this.devices.set(deviceId, updated);

    const evt = this.pushEvent({
      deviceId,
      deviceName: device.deviceName,
      type: "APPROVED",
      severity: "info",
      message: `${device.deviceName} unblocked — returned to active monitoring`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
    });

    this.emit([evt], []);
    return evt;
  }

  removeDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;

    this.pushEvent({
      deviceId,
      deviceName: device.deviceName,
      type: "REMOVED",
      severity: "info",
      message: `${device.deviceName} removed from monitoring list`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
    });

    this.devices.delete(deviceId);

    const toast = this.makeToast({
      type: "info",
      title: "Device Removed",
      message: `${device.deviceName} removed from the threat list`,
      autoDismiss: true,
    });

    this.emit([], [toast]);
  }

  convertToUser(deviceId: string, userName: string): DetectionEvent | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updated: UnauthorizedDevice = {
      ...device,
      status: "approved",
      convertedUserId: uid(),
      notes: `Converted to registered user: ${userName}`,
    };
    this.devices.set(deviceId, updated);

    const evt = this.pushEvent({
      deviceId,
      deviceName: device.deviceName,
      type: "CONVERTED",
      severity: "info",
      message: `${device.deviceName} converted to registered user "${userName}"`,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      metadata: { userName },
    });

    const toast = this.makeToast({
      type: "success",
      title: "User Created",
      message: `${device.deviceName} registered as user "${userName}"`,
      deviceId,
      autoDismiss: true,
    });

    this.emit([evt], [toast]);
    return evt;
  }

  // ── Event & toast helpers ─────────────────────────────────

  private pushEvent(
    partial: Omit<DetectionEvent, "id" | "timestamp">,
    timestamp?: Date
  ): DetectionEvent {
    const evt: DetectionEvent = {
      id: uid(),
      timestamp: timestamp ?? new Date(),
      ...partial,
    };
    this.eventLog = [evt, ...this.eventLog].slice(0, 300);
    return evt;
  }

  private makeToast(
    partial: Omit<ToastNotification, "id" | "timestamp">
  ): ToastNotification {
    return {
      id: uid(),
      timestamp: new Date(),
      dismissAfterMs: partial.autoDismiss ? 5000 : undefined,
      ...partial,
    };
  }

  // ── Getters ──────────────────────────────────────────────

  getDeviceArray(): UnauthorizedDevice[] {
    return [...this.devices.values()].sort(
      (a, b) => {
        // Sort: critical first, then by lastSeen desc
        const threatOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const ta = threatOrder[a.threatLevel] ?? 4;
        const tb = threatOrder[b.threatLevel] ?? 4;
        if (ta !== tb) return ta - tb;
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      }
    );
  }

  getEventLog(): DetectionEvent[] {
    return this.eventLog;
  }

  getStats(): DetectionStats {
    const all = this.getDeviceArray();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      totalDetected: all.length,
      activeThreats: all.filter(d => d.status === "active").length,
      blocked: all.filter(d => d.status === "blocked").length,
      approved: all.filter(d => d.status === "approved").length,
      monitoring: all.filter(d => d.status === "monitoring").length,
      criticalThreats: all.filter(d => d.threatLevel === "critical").length,
      todayDetected: all.filter(d => new Date(d.firstDetected) >= today).length,
      avgAttempts: all.length > 0
        ? Math.round(all.reduce((s, d) => s + d.attempts, 0) / all.length)
        : 0,
    };
  }
}
