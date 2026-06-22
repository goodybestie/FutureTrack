// ═══════════════════════════════════════════════════════════════
//  FutureTrack — Unauthorized Device Detection Engine Types
// ═══════════════════════════════════════════════════════════════

export type ThreatLevel = "critical" | "high" | "medium" | "low";
export type DeviceStatus = "active" | "blocked" | "approved" | "monitoring";
export type DeviceType = "mobile" | "desktop" | "tablet" | "iot" | "unknown";

export type AdminAction =
  | "BLOCK"
  | "APPROVE"
  | "REMOVE"
  | "CONVERT_USER"
  | "MONITOR"
  | "UNBLOCK";

export interface UnauthorizedDevice {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  ipAddress: string;
  macAddress: string;
  os: string;
  vendor: string;         // derived from MAC prefix
  ssid: string;
  signalStrength: number;

  // Detection info
  firstDetected: Date;
  lastSeen: Date;
  attempts: number;       // connection attempts
  status: DeviceStatus;
  threatLevel: ThreatLevel;

  // Admin tracking
  blockedAt?: Date;
  blockedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  notes?: string;
  convertedUserId?: string;

  // Network behavior flags
  isPortScanning: boolean;
  isHighFrequency: boolean;   // >10 attempts in 60s
  isSpoofingSuspected: boolean;
}

export interface DetectionEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  type:
    | "NEW_DEVICE"
    | "RECONNECT_ATTEMPT"
    | "BLOCKED_ATTEMPT"
    | "PORT_SCAN"
    | "HIGH_FREQUENCY"
    | "APPROVED"
    | "BLOCKED"
    | "REMOVED"
    | "CONVERTED"
    | "MONITORING_STARTED";
  timestamp: Date;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  ipAddress: string;
  macAddress: string;
  metadata?: Record<string, unknown>;
}

export interface ToastNotification {
  id: string;
  type: "threat" | "blocked" | "approved" | "info" | "success" | "warning";
  title: string;
  message: string;
  deviceId?: string;
  timestamp: Date;
  autoDismiss?: boolean;
  dismissAfterMs?: number;
}

export interface DetectionStats {
  totalDetected: number;
  activeThreats: number;
  blocked: number;
  approved: number;
  monitoring: number;
  criticalThreats: number;
  todayDetected: number;
  avgAttempts: number;
}

// ── Realistic fake device data pools ──────────────────────────

export const DEVICE_NAME_POOL = [
  "Android-7F3A", "iPhone-Unknown", "Kali-Linux-Box", "RaspberryPi-4B",
  "DESKTOP-XK9M2", "MacBook-Unregistered", "OnePlus-9Pro", "Pixel-7-Unauth",
  "Xiaomi-Redmi-Note", "Surface-Pro-Guest", "Lenovo-IdeaPad", "Samsung-Tab-S8",
  "ESP32-IoT-Device", "TP-LINK_Extender", "UNKNOWN-ANDROID", "Windows-Laptop",
  "Huawei-P40-Pro", "Nokia-G20", "OPPO-FindX3", "Realme-GT2",
];

export const OS_POOL = [
  "Android 13", "Android 14", "iOS 16.4", "iOS 17.1",
  "Windows 11", "Windows 10", "Ubuntu 22.04", "Kali Linux 2023",
  "macOS Ventura", "macOS Sonoma", "Raspberry Pi OS", "Unknown",
];

export const VENDOR_POOL = [
  "Samsung Electronics", "Apple Inc.", "Google LLC", "Xiaomi Corp",
  "Unknown Vendor", "Raspberry Pi Foundation", "TP-Link Technologies",
  "Huawei Technologies", "OnePlus Technology", "Realtek Semiconductor",
  "Intel Corporate", "Espressif Inc.", "ASUSTek Computer",
];

export const THREAT_MESSAGES: Record<ThreatLevel, string[]> = {
  critical: [
    "Device performing aggressive port scanning",
    "Possible MAC address spoofing detected",
    "High-frequency connection attempts — possible brute force",
    "Device fingerprint matches known attack tool",
  ],
  high: [
    "Unregistered device with repeated access attempts",
    "Device OS matches known vulnerability profile",
    "Multiple failed authentication attempts detected",
    "Device connecting outside business hours",
  ],
  medium: [
    "Unknown device detected on corporate network",
    "Device not in authorized MAC whitelist",
    "Guest device attempting secured network access",
    "Unrecognized hardware vendor",
  ],
  low: [
    "New device connected to open SSID",
    "Visitor device detected in lobby zone",
    "Personal device on corporate network",
    "Unregistered device — requires approval",
  ],
};
