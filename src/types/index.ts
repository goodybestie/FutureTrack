export type UserRole = "admin" | "manager" | "staff" | "security";
export type UserStatus = "active" | "inactive" | "suspended";
export type AttendanceStatus = "present" | "absent" | "late" | "early-leave" | "remote";
export type DeviceStatus = "authorized" | "unauthorized" | "pending" | "blocked";
export type CheckType = "check-in" | "check-out";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  avatar?: string;
  lastSeen?: string;
  joinDate: string;
  employeeId: string;
  phone?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  duration?: string;
  location: string;
  deviceId?: string;
}

export interface Device {
  id: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  lastSeen: string;
  status: DeviceStatus;
  location?: string;
  userId?: string;
  userName?: string;
  os?: string;
  type: "mobile" | "desktop" | "tablet" | "unknown";
  firstDetected: string;
  attempts?: number;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
  remoteWorkers: number;
  unauthorizedDevices: number;
  attendanceRate: number;
  avgCheckInTime: string;
}

export interface ChartDataPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  remote: number;
}

export interface Department {
  id: string;
  name: string;
  headCount: number;
  presentToday: number;
  manager: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
}
