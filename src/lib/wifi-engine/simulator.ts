// ═══════════════════════════════════════════════════════════════
//  FutureTrack WiFi Attendance Engine — Simulator
//  Drives automatic WiFi connect/disconnect events for demo.
//  Uses a weighted probability model to feel realistic.
// ═══════════════════════════════════════════════════════════════

import type { UserSession, WifiEvent, SimulatorConfig } from "./types";
import { handleConnect, handleDisconnect, handleSignalDrop, generateIP, generateMAC, generateSignal, pickLocation } from "./state-machine";
import { mockUsers } from "@/data/mock";

export type EngineCallback = (sessions: UserSession[], events: WifiEvent[]) => void;

const AVATAR_COLORS = [
  "bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500",
  "bg-cyan-500","bg-pink-500","bg-indigo-500","bg-teal-500",
  "bg-rose-500","bg-amber-500",
];

function buildInitialSessions(): UserSession[] {
  return mockUsers
    .filter(u => u.status === "active")
    .map((u, i) => ({
      userId: u.id,
      userName: u.name,
      email: u.email,
      department: u.department,
      role: u.role,
      employeeId: u.employeeId,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      connectionState: "offline" as const,
      ssid: "FutureTrack-Corp-5GHz",
      ipAddress: "",
      macAddress: generateMAC(),
      signalStrength: -100,
      location: pickLocation(),
      attendanceStatus: "not_started" as const,
      checkInTime: null,
      checkOutTime: null,
      totalMinutesActive: 0,
      sessionStartTime: null,
      reconnectCount: 0,
      isLateArrival: false,
      lastEventTime: new Date(),
      lastEventType: "DISCONNECT" as const }));
}

// Probability weights for auto-simulation events per user state
const TRANSITION_WEIGHTS = {
  offline: {
    connect: 0.45,      // likely to come online
    stay: 0.55 },
  connected: {
    signalDrop: 0.08,   // occasional signal wobble
    disconnect: 0.12,   // reasonable churn
    stay: 0.80 },
  reconnecting: {
    restore: 0.70,      // usually recovers
    disconnect: 0.30,   // sometimes fully drops
  } };

export class WifiSimulatorEngine {
  private sessions: Map<string, UserSession> = new Map();
  private eventLog: WifiEvent[] = [];
  private subscribers: Set<EngineCallback> = new Set();
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private config: SimulatorConfig;
  private tickCount = 0;

  constructor(config: SimulatorConfig) {
    this.config = config;
    buildInitialSessions().forEach(s => this.sessions.set(s.userId, s));
    // Boot with a few users already connected (realistic office scenario)
    this.bootInitialConnections();
  }

  // ── Lifecycle ───────────────────────────────────────────────

  private bootInitialConnections() {
    const ids = [...this.sessions.keys()];
    // Connect 60% of users immediately to simulate workday already in progress
    ids.slice(0, Math.floor(ids.length * 0.6)).forEach(uid => {
      this.processConnect(uid, true /* silent — no events emitted */);
    });
  }

  startAutoSimulation() {
    if (this.autoTimer) return;
    this.autoTimer = setInterval(() => this.tick(), this.config.simulationSpeedMs);
  }

  stopAutoSimulation() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  destroy() {
    this.stopAutoSimulation();
    this.subscribers.clear();
  }

  // ── Pub/Sub ──────────────────────────────────────────────────

  subscribe(cb: EngineCallback): () => void {
    this.subscribers.add(cb);
    // Immediately emit current state to new subscriber
    cb(this.getSessionArray(), []);
    return () => this.subscribers.delete(cb);
  }

  private emit(newEvents: WifiEvent[] = []) {
    const sessions = this.getSessionArray();
    if (newEvents.length > 0) {
      this.eventLog = [...newEvents, ...this.eventLog].slice(0, 200);
    }
    this.subscribers.forEach(cb => cb(sessions, newEvents));
  }

  // ── Auto-tick ────────────────────────────────────────────────

  private tick() {
    this.tickCount++;
    const ids = [...this.sessions.keys()];
    const newEvents: WifiEvent[] = [];

    // Process 1-2 random users per tick to stagger events naturally
    const sample = ids.sort(() => Math.random() - 0.5).slice(0, 2);

    sample.forEach(uid => {
      const session = this.sessions.get(uid)!;
      const events = this.autoTransition(session);
      newEvents.push(...events);
    });

    // Every 10 ticks, fluctuate signal strength on all connected users
    if (this.tickCount % 10 === 0) {
      [...this.sessions.values()]
        .filter(s => s.connectionState === "connected")
        .forEach(s => {
          this.sessions.set(s.userId, {
            ...s,
            signalStrength: generateSignal() });
        });
    }

    if (newEvents.length > 0) this.emit(newEvents);
    else this.emit(); // still notify for live timer updates
  }

  private autoTransition(session: UserSession): WifiEvent[] {
    const roll = Math.random();
    const events: WifiEvent[] = [];

    if (session.connectionState === "offline") {
      if (roll < TRANSITION_WEIGHTS.offline.connect) {
        events.push(...this.processConnect(session.userId));
      }
    } else if (session.connectionState === "connected") {
      if (roll < TRANSITION_WEIGHTS.connected.signalDrop) {
        events.push(...this.processSignalDrop(session.userId));
      } else if (roll < TRANSITION_WEIGHTS.connected.signalDrop + TRANSITION_WEIGHTS.connected.disconnect) {
        events.push(...this.processDisconnect(session.userId));
      }
    } else if (session.connectionState === "reconnecting") {
      if (roll < TRANSITION_WEIGHTS.reconnecting.restore) {
        events.push(...this.processConnect(session.userId));
      } else {
        events.push(...this.processDisconnect(session.userId));
      }
    }

    return events;
  }

  // ── Manual controls (called from UI) ────────────────────────

  connectUser(userId: string): WifiEvent[] {
    const events = this.processConnect(userId);
    if (events.length > 0) this.emit(events);
    return events;
  }

  disconnectUser(userId: string): WifiEvent[] {
    const events = this.processDisconnect(userId);
    if (events.length > 0) this.emit(events);
    return events;
  }

  simulateSignalDrop(userId: string): WifiEvent[] {
    const events = this.processSignalDrop(userId);
    if (events.length > 0) this.emit(events);
    return events;
  }

  connectAll(): WifiEvent[] {
    const allEvents: WifiEvent[] = [];
    [...this.sessions.keys()].forEach(uid => {
      const session = this.sessions.get(uid)!;
      if (session.connectionState === "offline") {
        allEvents.push(...this.processConnect(uid));
      }
    });
    if (allEvents.length) this.emit(allEvents);
    return allEvents;
  }

  disconnectAll(): WifiEvent[] {
    const allEvents: WifiEvent[] = [];
    [...this.sessions.keys()].forEach(uid => {
      const session = this.sessions.get(uid)!;
      if (session.connectionState !== "offline") {
        allEvents.push(...this.processDisconnect(uid));
      }
    });
    if (allEvents.length) this.emit(allEvents);
    return allEvents;
  }

  updateConfig(patch: Partial<SimulatorConfig>) {
    this.config = { ...this.config, ...patch };
    if (patch.simulationSpeedMs && this.autoTimer) {
      this.stopAutoSimulation();
      this.startAutoSimulation();
    }
  }

  // ── Internal transition processors ──────────────────────────

  private processConnect(userId: string, silent = false): WifiEvent[] {
    const session = this.sessions.get(userId);
    if (!session) return [];

    // Assign new IP if not set
    const withIp: UserSession = session.ipAddress
      ? session
      : { ...session, ipAddress: generateIP(), location: pickLocation() };

    const { session: next, events } = handleConnect(withIp, this.config);
    this.sessions.set(userId, next);
    return silent ? [] : events;
  }

  private processDisconnect(userId: string): WifiEvent[] {
    const session = this.sessions.get(userId);
    if (!session) return [];
    const { session: next, events } = handleDisconnect(session, this.config);
    this.sessions.set(userId, next);
    return events;
  }

  private processSignalDrop(userId: string): WifiEvent[] {
    const session = this.sessions.get(userId);
    if (!session || session.connectionState !== "connected") return [];
    const { session: next, events } = handleSignalDrop(session);
    this.sessions.set(userId, next);
    return events;
  }

  // ── Getters ──────────────────────────────────────────────────

  getSessionArray(): UserSession[] {
    return [...this.sessions.values()];
  }

  getEventLog(): WifiEvent[] {
    return this.eventLog;
  }

  getConfig(): SimulatorConfig {
    return this.config;
  }

  getStats() {
    const sessions = this.getSessionArray();
    const connected = sessions.filter(s => s.connectionState === "connected").length;
    const checkedIn = sessions.filter(
      s => s.attendanceStatus === "checked_in" || s.attendanceStatus === "late"
    ).length;
    const checkedOut = sessions.filter(s => s.attendanceStatus === "checked_out").length;
    const late = sessions.filter(s => s.attendanceStatus === "late").length;
    const absent = sessions.filter(s => s.attendanceStatus === "not_started").length;

    return {
      total: sessions.length,
      connected,
      disconnected: sessions.length - connected,
      checkedIn,
      checkedOut,
      late,
      absent };
  }
}
