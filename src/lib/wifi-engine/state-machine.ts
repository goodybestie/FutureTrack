// ═══════════════════════════════════════════════════════════════
//  FutureTrack WiFi Attendance Engine — State Machine
//  Pure TypeScript — no React, no Supabase dependency.
//  Handles all attendance business logic deterministically.
// ═══════════════════════════════════════════════════════════════

import type {
  UserSession, WifiEvent, EventType,
  AttendanceStatus, SimulatorConfig,
} from "./types";
import { OFFICE_LOCATIONS } from "./types";

// ── Helpers ──────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateIP(): string {
  return `192.168.${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 200) + 10}`;
}

export function generateMAC(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join(":");
}

export function generateSignal(): number {
  // Weighted toward good/excellent for registered users
  const base = Math.random();
  if (base < 0.3) return Math.floor(Math.random() * 20) - 50;  // -50 to -30
  if (base < 0.7) return Math.floor(Math.random() * 15) - 65;  // -65 to -51
  return Math.floor(Math.random() * 10) - 75;                   // -75 to -66
}

export function pickLocation(): string {
  return OFFICE_LOCATIONS[Math.floor(Math.random() * OFFICE_LOCATIONS.length)];
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function isLateArrival(
  checkInTime: Date,
  config: Pick<SimulatorConfig, "workStartHour" | "lateThresholdMinutes">
): boolean {
  const thresholdMs =
    (config.workStartHour * 60 + config.lateThresholdMinutes) * 60 * 1000;
  const todayStart = new Date(checkInTime);
  todayStart.setHours(0, 0, 0, 0);
  const checkInMs = checkInTime.getTime() - todayStart.getTime();
  return checkInMs > thresholdMs;
}

// ── Event factory ─────────────────────────────────────────────

function makeEvent(
  type: EventType,
  session: UserSession,
  message: string,
  metadata?: Record<string, unknown>
): WifiEvent {
  return {
    id: generateId(),
    type,
    userId: session.userId,
    userName: session.userName,
    department: session.department,
    timestamp: new Date(),
    ssid: session.ssid,
    signalStrength: session.signalStrength,
    ipAddress: session.ipAddress,
    macAddress: session.macAddress,
    location: session.location,
    message,
    metadata,
  };
}

// ── State machine transitions ─────────────────────────────────

export interface TransitionResult {
  session: UserSession;
  events: WifiEvent[];
}

/**
 * CONNECT — User device authenticates to the corporate WiFi.
 * If they have no check-in today, creates one.
 * If they reconnected within a session, resumes it.
 */
export function handleConnect(
  prev: UserSession,
  config: SimulatorConfig
): TransitionResult {
  const now = new Date();
  const events: WifiEvent[] = [];

  // Transitioning state: connecting → connected
  const connecting: UserSession = {
    ...prev,
    connectionState: "connecting",
    ipAddress: generateIP(),
    signalStrength: generateSignal(),
    lastEventTime: now,
    lastEventType: "CONNECT",
  };

  // Determine attendance outcome
  let attendanceStatus: AttendanceStatus = prev.attendanceStatus;
  let checkInTime = prev.checkInTime;
  let isLate = prev.isLateArrival;
  let reconnectCount = prev.reconnectCount;
  let sessionStartTime = now;

  const isReconnect = prev.attendanceStatus === "checked_in" || prev.connectionState === "reconnecting";

  if (isReconnect && prev.checkInTime) {
    // Resuming an existing session — don't create new check-in
    reconnectCount += 1;
    events.push(makeEvent("SESSION_RESUMED", connecting,
      `Session resumed on ${config.networkSSID} · Reconnect #${reconnectCount}`));
  } else if (prev.attendanceStatus === "not_started" || prev.attendanceStatus === "absent") {
    // First connect today — create check-in
    checkInTime = now;
    isLate = isLateArrival(now, config);
    attendanceStatus = isLate ? "late" : "checked_in";

    events.push(makeEvent("CHECK_IN", connecting,
      `Checked in via WiFi${isLate ? " (late arrival)" : ""}`,
      { isLate, checkInTime: now.toISOString() }));
  } else if (prev.attendanceStatus === "checked_out") {
    // Already checked out — this is a return (don't override checkout)
    events.push(makeEvent("CONNECT", connecting,
      `Reconnected after checkout — monitoring only`));
  } else if (
    prev.connectionState === "connected" &&
    (prev.attendanceStatus === "checked_in" || prev.attendanceStatus === "late")
  ) {
    // Fully connected + already checked in — block duplicate
    const dupEvent = makeEvent(
      "DUPLICATE_BLOCKED",
      prev,
      `Duplicate check-in blocked — already active since ${
        prev.checkInTime
          ? new Date(prev.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : "earlier"
      }`
    );
    return { session: prev, events: [dupEvent] };
  }

  events.push(makeEvent("CONNECT", connecting,
    `Connected to ${config.networkSSID} · ${connecting.ipAddress}`,
    { signalStrength: connecting.signalStrength }));

  const next: UserSession = {
    ...connecting,
    connectionState: "connected",
    attendanceStatus,
    checkInTime,
    isLateArrival: isLate,
    reconnectCount,
    sessionStartTime,
    lastEventType: "CONNECT",
  };

  return { session: next, events };
}

/**
 * DISCONNECT — Device leaves the network.
 * If their first checkout, records check-out time and calculates hours.
 */
export function handleDisconnect(
  prev: UserSession,
  config: SimulatorConfig
): TransitionResult {
  const now = new Date();
  const events: WifiEvent[] = [];

  if (prev.connectionState === "offline") {
    return { session: prev, events };
  }

  // Accumulate active time from this session
  const sessionMinutes = prev.sessionStartTime
    ? (now.getTime() - prev.sessionStartTime.getTime()) / 60000
    : 0;

  const totalMinutesActive = prev.totalMinutesActive + sessionMinutes;

  let attendanceStatus = prev.attendanceStatus;
  let checkOutTime = prev.checkOutTime;

  // First disconnect of the day → check out
  if (prev.attendanceStatus === "checked_in" || prev.attendanceStatus === "late") {
    attendanceStatus = "checked_out";
    checkOutTime = now;

    events.push(makeEvent("CHECK_OUT", prev,
      `Checked out · Active for ${formatDuration(totalMinutesActive)}`,
      { totalMinutes: totalMinutesActive, checkOutTime: now.toISOString() }));
  }

  events.push(makeEvent("DISCONNECT", prev,
    `Disconnected from ${config.networkSSID}`));

  const next: UserSession = {
    ...prev,
    connectionState: "offline",
    attendanceStatus,
    checkOutTime,
    totalMinutesActive,
    sessionStartTime: null,
    signalStrength: -100,
    lastEventTime: now,
    lastEventType: "DISCONNECT",
  };

  return { session: next, events };
}

/**
 * SIGNAL_DROP — Temporary signal loss. Moves to reconnecting.
 * A timer in the engine will either call handleConnect (restore) 
 * or handleDisconnect (full drop) based on simulation.
 */
export function handleSignalDrop(prev: UserSession): TransitionResult {
  const now = new Date();

  const event = makeEvent("SIGNAL_DROP", prev,
    `Signal dropped on ${prev.ssid} · Attempting to reconnect…`);

  const next: UserSession = {
    ...prev,
    connectionState: "reconnecting",
    signalStrength: -88,
    lastEventTime: now,
    lastEventType: "SIGNAL_DROP",
  };

  return { session: next, events: [event] };
}

/**
 * SIGNAL_RESTORE — Signal recovered without full disconnect.
 */
export function handleSignalRestore(prev: UserSession): TransitionResult {
  const now = new Date();
  const newSignal = generateSignal();

  const event = makeEvent("SIGNAL_RESTORE", prev,
    `Signal restored · ${newSignal} dBm`);

  const next: UserSession = {
    ...prev,
    connectionState: "connected",
    signalStrength: newSignal,
    lastEventTime: now,
    lastEventType: "SIGNAL_RESTORE",
  };

  return { session: next, events: [event] };
}

// ── Computed helpers on sessions ─────────────────────────────

export function computeLiveMinutes(session: UserSession): number {
  if (!session.sessionStartTime || session.connectionState !== "connected") {
    return session.totalMinutesActive;
  }
  const liveMinutes = (Date.now() - session.sessionStartTime.getTime()) / 60000;
  return session.totalMinutesActive + liveMinutes;
}

export function getSignalLabel(dbm: number): string {
  if (dbm >= -50) return "Excellent";
  if (dbm >= -65) return "Good";
  if (dbm >= -75) return "Fair";
  return "Weak";
}

export function getSignalBars(dbm: number): 1 | 2 | 3 | 4 {
  if (dbm >= -50) return 4;
  if (dbm >= -65) return 3;
  if (dbm >= -75) return 2;
  return 1;
}
