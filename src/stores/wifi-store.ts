"use client";
// ═══════════════════════════════════════════════════════════════
//  FutureTrack — WiFi Attendance Store (Zustand)
//  Single source of truth for all session + event state.
//  Lazy-initializes the engine once on first access.
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { UserSession, WifiEvent, SimulatorConfig } from "@/lib/wifi-engine/types";
import { DEFAULT_CONFIG } from "@/lib/wifi-engine/types";
import { WifiSimulatorEngine } from "@/lib/wifi-engine/simulator";

interface WifiStore {
  // ── State ──────────────────────────────────────────────────
  sessions: UserSession[];
  eventLog: WifiEvent[];
  config: SimulatorConfig;
  isAutoRunning: boolean;
  engine: WifiSimulatorEngine | null;
  initialized: boolean;
  tick: number; // increments every second for live timers
  /**
   * Interval handle for the 1-second live-duration ticker.
   * Stored here (typed) rather than monkey-patched onto the engine
   * instance, so destroy() can clean it up without an `as any` cast.
   */
  tickerId: ReturnType<typeof setInterval> | null;

  // ── Actions ────────────────────────────────────────────────
  init: () => void;
  destroy: () => void;

  connectUser: (userId: string) => void;
  disconnectUser: (userId: string) => void;
  signalDrop: (userId: string) => void;
  connectAll: () => void;
  disconnectAll: () => void;

  startAuto: () => void;
  stopAuto: () => void;
  updateConfig: (patch: Partial<SimulatorConfig>) => void;

  // ── Derived helpers ────────────────────────────────────────
  getSession: (userId: string) => UserSession | undefined;
  getStats: () => ReturnType<WifiSimulatorEngine["getStats"]>;
}

export const useWifiStore = create<WifiStore>()(
  subscribeWithSelector((set, get) => ({
    sessions: [],
    eventLog: [],
    config: DEFAULT_CONFIG,
    isAutoRunning: false,
    engine: null,
    initialized: false,
    tick: 0,
    tickerId: null,

    init() {
      if (get().initialized) return;

      const engine = new WifiSimulatorEngine(get().config);

      // Subscribe to engine updates
      engine.subscribe((sessions, newEvents) => {
        set(s => ({
          sessions: [...sessions],
          eventLog: newEvents.length > 0
            ? [...newEvents, ...s.eventLog].slice(0, 200)
            : s.eventLog,
        }));
      });

      // 1-second ticker to keep live durations fresh
      const tickerId = setInterval(() => {
        set(s => ({ tick: s.tick + 1 }));
      }, 1000);

      set({
        engine,
        initialized: true,
        sessions: engine.getSessionArray(),
        tickerId,
      });
    },

    destroy() {
      const { engine, tickerId } = get();
      if (tickerId !== null) clearInterval(tickerId);
      engine?.destroy();
      set({ engine: null, initialized: false, isAutoRunning: false, tickerId: null });
    },

    connectUser(userId) {
      get().engine?.connectUser(userId);
    },

    disconnectUser(userId) {
      get().engine?.disconnectUser(userId);
    },

    signalDrop(userId) {
      get().engine?.simulateSignalDrop(userId);
    },

    connectAll() {
      get().engine?.connectAll();
    },

    disconnectAll() {
      get().engine?.disconnectAll();
    },

    startAuto() {
      get().engine?.startAutoSimulation();
      set({ isAutoRunning: true });
    },

    stopAuto() {
      get().engine?.stopAutoSimulation();
      set({ isAutoRunning: false });
    },

    updateConfig(patch) {
      const next = { ...get().config, ...patch };
      get().engine?.updateConfig(patch);
      set({ config: next });
    },

    getSession(userId) {
      return get().sessions.find(s => s.userId === userId);
    },

    getStats() {
      const engine = get().engine;
      if (engine) return engine.getStats();
      const sessions = get().sessions;
      return {
        total: sessions.length,
        connected: sessions.filter(s => s.connectionState === "connected").length,
        disconnected: sessions.filter(s => s.connectionState === "offline").length,
        checkedIn: sessions.filter(s => s.attendanceStatus === "checked_in" || s.attendanceStatus === "late").length,
        checkedOut: sessions.filter(s => s.attendanceStatus === "checked_out").length,
        late: sessions.filter(s => s.attendanceStatus === "late").length,
        absent: sessions.filter(s => s.attendanceStatus === "not_started").length,
      };
    },
  }))
);

// Selector hooks — prevents unnecessary re-renders
export const useSessions = () => useWifiStore(s => s.sessions);
export const useEventLog = () => useWifiStore(s => s.eventLog);
export const useIsAutoRunning = () => useWifiStore(s => s.isAutoRunning);
export const useWifiConfig = () => useWifiStore(s => s.config);
export const useTick = () => useWifiStore(s => s.tick);

export const useSessionStats = () =>
  useWifiStore(s => {
    const sessions = s.sessions;
    return {
      total: sessions.length,
      connected: sessions.filter(x => x.connectionState === "connected").length,
      reconnecting: sessions.filter(x => x.connectionState === "reconnecting").length,
      offline: sessions.filter(x => x.connectionState === "offline").length,
      checkedIn: sessions.filter(x => x.attendanceStatus === "checked_in" || x.attendanceStatus === "late").length,
      checkedOut: sessions.filter(x => x.attendanceStatus === "checked_out").length,
      late: sessions.filter(x => x.attendanceStatus === "late").length,
      absent: sessions.filter(x => x.attendanceStatus === "not_started").length,
    };
  });
