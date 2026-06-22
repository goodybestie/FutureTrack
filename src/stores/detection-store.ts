"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { UnauthorizedDeviceEngine } from "@/lib/detection-engine/engine";
import type {
  UnauthorizedDevice, DetectionEvent, ToastNotification, DetectionStats,
} from "@/lib/detection-engine/types";

interface DetectionStore {
  // ── State ──────────────────────────────────────────────────
  devices: UnauthorizedDevice[];
  eventLog: DetectionEvent[];
  toastQueue: ToastNotification[];
  engine: UnauthorizedDeviceEngine | null;
  initialized: boolean;
  isAutoRunning: boolean;
  simulationSpeedMs: number;

  // ── Lifecycle ──────────────────────────────────────────────
  init: () => void;
  destroy: () => void;

  // ── Simulation controls ────────────────────────────────────
  startAuto: () => void;
  stopAuto: () => void;
  triggerNewDevice: () => void;
  setSpeed: (ms: number) => void;

  // ── Admin actions ──────────────────────────────────────────
  blockDevice: (id: string) => void;
  approveDevice: (id: string) => void;
  monitorDevice: (id: string) => void;
  unblockDevice: (id: string) => void;
  removeDevice: (id: string) => void;
  convertToUser: (id: string, userName: string) => void;

  // ── Toast management ───────────────────────────────────────
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // ── Derived ────────────────────────────────────────────────
  getStats: () => DetectionStats;
}

export const useDetectionStore = create<DetectionStore>()(
  subscribeWithSelector((set, get) => ({
    devices: [],
    eventLog: [],
    toastQueue: [],
    engine: null,
    initialized: false,
    isAutoRunning: false,
    simulationSpeedMs: 6000,

    init() {
      if (get().initialized) return;

      const engine = new UnauthorizedDeviceEngine(get().simulationSpeedMs);

      engine.subscribe((devices, newEvents, newToasts) => {
        set(s => ({
          devices: [...devices],
          eventLog: newEvents.length > 0
            ? [...newEvents, ...s.eventLog].slice(0, 300)
            : s.eventLog,
          toastQueue: newToasts.length > 0
            ? [...s.toastQueue, ...newToasts]
            : s.toastQueue,
        }));
      });

      set({
        engine,
        initialized: true,
        devices: engine.getDeviceArray(),
        eventLog: engine.getEventLog(),
      });
    },

    destroy() {
      get().engine?.destroy();
      set({ engine: null, initialized: false, isAutoRunning: false });
    },

    startAuto() {
      get().engine?.startAutoDetection();
      set({ isAutoRunning: true });
    },

    stopAuto() {
      get().engine?.stopAutoDetection();
      set({ isAutoRunning: false });
    },

    triggerNewDevice() {
      get().engine?.simulateNewDevice();
    },

    setSpeed(ms) {
      get().engine?.updateSpeed(ms);
      set({ simulationSpeedMs: ms });
    },

    blockDevice(id) {
      get().engine?.blockDevice(id);
    },

    approveDevice(id) {
      get().engine?.approveDevice(id);
    },

    monitorDevice(id) {
      get().engine?.startMonitoring(id);
    },

    unblockDevice(id) {
      get().engine?.unblockDevice(id);
    },

    removeDevice(id) {
      get().engine?.removeDevice(id);
    },

    convertToUser(id, userName) {
      get().engine?.convertToUser(id, userName);
    },

    dismissToast(id) {
      set(s => ({ toastQueue: s.toastQueue.filter(t => t.id !== id) }));
    },

    clearToasts() {
      set({ toastQueue: [] });
    },

    getStats() {
      return get().engine?.getStats() ?? {
        totalDetected: 0, activeThreats: 0, blocked: 0,
        approved: 0, monitoring: 0, criticalThreats: 0,
        todayDetected: 0, avgAttempts: 0,
      };
    },
  }))
);

// Selector hooks
export const useUnauthorizedDevices = () => useDetectionStore(s => s.devices);
export const useDetectionEventLog = () => useDetectionStore(s => s.eventLog);
export const useToastQueue = () => useDetectionStore(s => s.toastQueue);
export const useDetectionStats = () =>
  useDetectionStore(s => {
    const d = s.devices;
    return {
      total: d.length,
      active: d.filter(x => x.status === "active").length,
      blocked: d.filter(x => x.status === "blocked").length,
      approved: d.filter(x => x.status === "approved").length,
      monitoring: d.filter(x => x.status === "monitoring").length,
      critical: d.filter(x => x.threatLevel === "critical").length,
    };
  });
