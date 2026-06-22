/**
 * FutureTrack — Supabase Database Types
 *
 * These are hand-authored to match schema.sql exactly.
 * For production, replace with auto-generated types:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enums ────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "staff" | "security";
export type UserStatus = "active" | "inactive" | "suspended";
export type AttendanceStatus = "present" | "absent" | "late" | "early_leave" | "remote";
export type ConnectionStatus = "connected" | "disconnected";
export type DeviceType = "mobile" | "desktop" | "tablet" | "unknown";

// ── Row types (what comes OUT of the DB) ────────────────────
export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string | null;
  employee_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLogRow {
  id: string;
  user_id: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  status: AttendanceStatus;
  location: string | null;
  device_id: string | null;
  notes: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceSessionRow {
  id: string;
  user_id: string | null;
  device_name: string;
  device_ip: string | null;
  mac_address: string | null;
  os: string | null;
  device_type: DeviceType | null;
  connection_status: ConnectionStatus;
  connected_at: string;
  disconnected_at: string | null;
  last_seen: string;
  created_at: string;
}

export interface UnauthorizedDeviceRow {
  id: string;
  device_name: string;
  device_ip: string | null;
  mac_address: string | null;
  device_type: DeviceType | null;
  os: string | null;
  detected_at: string;
  last_attempt: string;
  attempts: number;
  blocked: boolean;
  blocked_at: string | null;
  blocked_by: string | null;
  notes: string | null;
  created_at: string;
}

// ── Insert types (what you PUT into the DB) ─────────────────
export type UserInsert = Omit<UserRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export type AttendanceLogInsert = Omit<
  AttendanceLogRow,
  "id" | "total_hours" | "created_at" | "updated_at"
> & {
  id?: string;
  total_hours?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type DeviceSessionInsert = Omit<
  DeviceSessionRow,
  "id" | "created_at" | "last_seen"
> & {
  id?: string;
  created_at?: string;
  last_seen?: string;
};

export type UnauthorizedDeviceInsert = Omit<
  UnauthorizedDeviceRow,
  "id" | "detected_at" | "last_attempt" | "created_at"
> & {
  id?: string;
  detected_at?: string;
  last_attempt?: string;
  created_at?: string;
};

// ── Update types ─────────────────────────────────────────────
export type UserUpdate = Partial<UserInsert>;
export type AttendanceLogUpdate = Partial<AttendanceLogInsert>;
export type DeviceSessionUpdate = Partial<DeviceSessionInsert>;
export type UnauthorizedDeviceUpdate = Partial<UnauthorizedDeviceInsert>;

// ── Joined / enriched types ──────────────────────────────────
export interface AttendanceLogWithUser extends AttendanceLogRow {
  users: Pick<UserRow, "id" | "full_name" | "email" | "department" | "avatar_url">;
}

export interface DeviceSessionWithUser extends DeviceSessionRow {
  users: Pick<UserRow, "id" | "full_name" | "email"> | null;
}

// ── View types ───────────────────────────────────────────────
export interface TodayAttendanceSummary {
  total_checked_in: number;
  present: number;
  absent: number;
  late: number;
  remote: number;
  early_leave: number;
  avg_checkin_hour: number | null;
}

export interface UnauthorizedAlerts {
  active_threats: number;
  blocked: number;
  total: number;
}

// ── Database interface (used to type createClient) ───────────
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      attendance_logs: {
        Row: AttendanceLogRow;
        Insert: AttendanceLogInsert;
        Update: AttendanceLogUpdate;
      };
      device_sessions: {
        Row: DeviceSessionRow;
        Insert: DeviceSessionInsert;
        Update: DeviceSessionUpdate;
      };
      unauthorized_devices: {
        Row: UnauthorizedDeviceRow;
        Insert: UnauthorizedDeviceInsert;
        Update: UnauthorizedDeviceUpdate;
      };
    };
    Views: {
      today_attendance_summary: { Row: TodayAttendanceSummary };
      active_devices_count: {
        Row: { connected: number; disconnected: number; total: number };
      };
      unauthorized_alerts: { Row: UnauthorizedAlerts };
    };
    Functions: {
      get_user_role: { Args: { uid?: string }; Returns: UserRole };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      attendance_status: AttendanceStatus;
      connection_status: ConnectionStatus;
    };
  };
}
