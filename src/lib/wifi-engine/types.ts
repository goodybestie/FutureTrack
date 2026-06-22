// ═══════════════════════════════════════════════════════════════
//  FutureTrack WiFi Attendance Engine — Core Types
// ═══════════════════════════════════════════════════════════════

export type ConnectionState =
  | "offline"        // Not connected
  | "connecting"     // DHCP handshake in progress
  | "connected"      // Fully connected, session active
  | "reconnecting"   // Brief drop, attempting to restore
  | "disconnecting"; // Graceful teardown

export type AttendanceStatus =
  | "not_started"  // No record today
  | "checked_in"   // Active session
  | "checked_out"  // Session closed
  | "late"         // Checked in after threshold
  | "absent";      // Never connected today

export type EventType =
  | "CONNECT"
  | "DISCONNECT"
  | "RECONNECT"
  | "SIGNAL_DROP"
  | "SIGNAL_RESTORE"
  | "CHECK_IN"
  | "CHECK_OUT"
  | "DUPLICATE_BLOCKED"
  | "SESSION_RESUMED"
  | "UNAUTHORIZED";

export interface WifiEvent {
  id: string;
  type: EventType;
  userId: string;
  userName: string;
  department: string;
  timestamp: Date;
  ssid?: string;
  signalStrength?: number; // -30 to -90 dBm
  ipAddress?: string;
  macAddress?: string;
  location?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface UserSession {
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  employeeId: string;
  avatarColor: string;

  // Connection state
  connectionState: ConnectionState;
  ssid: string;
  ipAddress: string;
  macAddress: string;
  signalStrength: number;
  location: string;

  // Attendance
  attendanceStatus: AttendanceStatus;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  totalMinutesActive: number;    // accumulated across reconnects
  sessionStartTime: Date | null; // current session start
  reconnectCount: number;
  isLateArrival: boolean;

  // Meta
  lastEventTime: Date;
  lastEventType: EventType;
}

export interface AttendanceSummary {
  totalEmployees: number;
  connected: number;
  disconnected: number;
  checkedIn: number;
  checkedOut: number;
  late: number;
  absent: number;
  averageCheckIn: string | null;
  averageHours: number;
}

export interface SimulatorConfig {
  networkSSID: string;
  workStartHour: number;       // 9
  lateThresholdMinutes: number; // 15
  workEndHour: number;         // 17
  reconnectDelayMs: number;    // 2000
  autoSimulate: boolean;
  simulationSpeedMs: number;   // interval between random events
}

export const DEFAULT_CONFIG: SimulatorConfig = {
  networkSSID: "FutureTrack-Corp-5GHz",
  workStartHour: 9,
  lateThresholdMinutes: 15,
  workEndHour: 17,
  reconnectDelayMs: 2500,
  autoSimulate: false,
  simulationSpeedMs: 4000,
};

export const OFFICE_LOCATIONS = [
  "HQ — Floor 1 (Lobby)",
  "HQ — Floor 2 (Product)",
  "HQ — Floor 3 (Engineering)",
  "HQ — Floor 4 (Design)",
  "HQ — Board Room",
  "HQ — Gate / Security",
  "Remote — VPN",
];

export const SIGNAL_LEVELS = {
  excellent: { min: -50, max: -30, label: "Excellent" },
  good: { min: -65, max: -51, label: "Good" },
  fair: { min: -75, max: -66, label: "Fair" },
  weak: { min: -90, max: -76, label: "Weak" },
};
