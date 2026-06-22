import type {
  User, AttendanceRecord, Device, DashboardStats,
  ChartDataPoint, Department, Notification
} from "@/types";

export const mockUsers: User[] = [
  { id: "u1", name: "Amara Okonkwo", email: "amara@futuretrack.io", role: "admin", status: "active", department: "Engineering", lastSeen: "2 min ago", joinDate: "2022-01-15", employeeId: "EMP001", phone: "+234 801 234 5678" },
  { id: "u2", name: "Chidi Eze", email: "chidi@futuretrack.io", role: "manager", status: "active", department: "Product", lastSeen: "5 min ago", joinDate: "2021-08-20", employeeId: "EMP002", phone: "+234 802 345 6789" },
  { id: "u3", name: "Fatima Al-Hassan", email: "fatima@futuretrack.io", role: "staff", status: "active", department: "Design", lastSeen: "12 min ago", joinDate: "2023-03-10", employeeId: "EMP003" },
  { id: "u4", name: "Kwame Asante", email: "kwame@futuretrack.io", role: "staff", status: "active", department: "Engineering", lastSeen: "1 hr ago", joinDate: "2022-06-05", employeeId: "EMP004" },
  { id: "u5", name: "Ngozi Adeyemi", email: "ngozi@futuretrack.io", role: "manager", status: "active", department: "HR", lastSeen: "30 min ago", joinDate: "2020-11-22", employeeId: "EMP005" },
  { id: "u6", name: "Emeka Nwosu", email: "emeka@futuretrack.io", role: "staff", status: "inactive", department: "Finance", lastSeen: "3 days ago", joinDate: "2023-01-08", employeeId: "EMP006" },
  { id: "u7", name: "Aisha Bello", email: "aisha@futuretrack.io", role: "staff", status: "active", department: "Engineering", lastSeen: "8 min ago", joinDate: "2022-09-14", employeeId: "EMP007" },
  { id: "u8", name: "Tunde Bakare", email: "tunde@futuretrack.io", role: "security", status: "active", department: "Security", lastSeen: "Just now", joinDate: "2021-04-30", employeeId: "EMP008" },
  { id: "u9", name: "Chisom Obi", email: "chisom@futuretrack.io", role: "staff", status: "suspended", department: "Operations", lastSeen: "5 days ago", joinDate: "2022-12-01", employeeId: "EMP009" },
  { id: "u10", name: "Olumide Adebayo", email: "olumide@futuretrack.io", role: "staff", status: "active", department: "Marketing", lastSeen: "45 min ago", joinDate: "2023-05-18", employeeId: "EMP010" },
];

export const mockAttendance: AttendanceRecord[] = [
  { id: "a1", userId: "u1", userName: "Amara Okonkwo", department: "Engineering", date: "2025-05-09", checkIn: "08:47", checkOut: "17:32", status: "present", duration: "8h 45m", location: "HQ - Floor 3", deviceId: "d1" },
  { id: "a2", userId: "u2", userName: "Chidi Eze", department: "Product", date: "2025-05-09", checkIn: "09:12", checkOut: "", status: "present", duration: "Active", location: "HQ - Floor 2", deviceId: "d2" },
  { id: "a3", userId: "u3", userName: "Fatima Al-Hassan", department: "Design", date: "2025-05-09", checkIn: "09:55", status: "late", duration: "Active", location: "Remote", deviceId: "d3" },
  { id: "a4", userId: "u4", userName: "Kwame Asante", department: "Engineering", date: "2025-05-09", checkIn: "08:02", checkOut: "14:30", status: "early-leave", duration: "6h 28m", location: "HQ - Floor 3" },
  { id: "a5", userId: "u5", userName: "Ngozi Adeyemi", department: "HR", date: "2025-05-09", checkIn: "08:30", status: "present", duration: "Active", location: "HQ - Floor 1" },
  { id: "a6", userId: "u6", userName: "Emeka Nwosu", department: "Finance", date: "2025-05-09", status: "absent", location: "-" },
  { id: "a7", userId: "u7", userName: "Aisha Bello", department: "Engineering", date: "2025-05-09", checkIn: "08:55", status: "present", duration: "Active", location: "HQ - Floor 3" },
  { id: "a8", userId: "u8", userName: "Tunde Bakare", department: "Security", date: "2025-05-09", checkIn: "07:00", status: "present", duration: "Active", location: "HQ - Gate", deviceId: "d4" },
  { id: "a9", userId: "u10", userName: "Olumide Adebayo", department: "Marketing", date: "2025-05-09", checkIn: "09:05", status: "present", duration: "Active", location: "Remote" },
  { id: "a10", userId: "u2", userName: "Chidi Eze", department: "Product", date: "2025-05-08", checkIn: "08:50", checkOut: "18:10", status: "present", duration: "9h 20m", location: "HQ - Floor 2" },
  { id: "a11", userId: "u3", userName: "Fatima Al-Hassan", department: "Design", date: "2025-05-08", checkIn: "09:02", checkOut: "17:15", status: "present", duration: "8h 13m", location: "HQ - Floor 4" },
  { id: "a12", userId: "u1", userName: "Amara Okonkwo", department: "Engineering", date: "2025-05-08", checkIn: "08:30", checkOut: "17:00", status: "present", duration: "8h 30m", location: "HQ - Floor 3" },
];

export const mockDevices: Device[] = [
  { id: "d1", name: "MacBook Pro 14\"", macAddress: "A4:83:E7:2C:1F:09", ipAddress: "192.168.1.101", lastSeen: "2 min ago", status: "authorized", location: "HQ - Floor 3", userId: "u1", userName: "Amara Okonkwo", os: "macOS 14.4", type: "desktop", firstDetected: "2022-01-15", attempts: 0 },
  { id: "d2", name: "ThinkPad X1 Carbon", macAddress: "B2:5C:F1:44:A8:3D", ipAddress: "192.168.1.102", lastSeen: "5 min ago", status: "authorized", location: "HQ - Floor 2", userId: "u2", userName: "Chidi Eze", os: "Windows 11", type: "desktop", firstDetected: "2021-08-20", attempts: 0 },
  { id: "d3", name: "iPhone 15 Pro", macAddress: "C6:7D:22:BB:90:E1", ipAddress: "192.168.1.145", lastSeen: "12 min ago", status: "authorized", userId: "u3", userName: "Fatima Al-Hassan", os: "iOS 17.4", type: "mobile", firstDetected: "2023-03-10", attempts: 0 },
  { id: "d4", name: "Samsung Galaxy S24", macAddress: "D1:A9:4E:CC:28:F7", ipAddress: "192.168.1.189", lastSeen: "Just now", status: "authorized", location: "HQ - Gate", userId: "u8", userName: "Tunde Bakare", os: "Android 14", type: "mobile", firstDetected: "2021-04-30", attempts: 0 },
  { id: "d5", name: "Unknown Android", macAddress: "E8:3F:19:77:DC:42", ipAddress: "192.168.1.210", lastSeen: "34 min ago", status: "unauthorized", os: "Android 12", type: "mobile", firstDetected: "2025-05-09", attempts: 7 },
  { id: "d6", name: "Unknown Desktop", macAddress: "F2:11:88:30:4A:B6", ipAddress: "192.168.1.220", lastSeen: "1 hr ago", status: "unauthorized", type: "desktop", firstDetected: "2025-05-08", attempts: 12 },
  { id: "d7", name: "Suspicious Tablet", macAddress: "G4:CC:70:12:EF:09", ipAddress: "192.168.2.15", lastSeen: "2 hrs ago", status: "blocked", type: "tablet", firstDetected: "2025-05-07", attempts: 34 },
  { id: "d8", name: "iPad Pro (Work)", macAddress: "H7:55:A1:99:3B:22", ipAddress: "192.168.1.155", lastSeen: "20 min ago", status: "pending", userId: "u10", userName: "Olumide Adebayo", os: "iPadOS 17", type: "tablet", firstDetected: "2025-05-09", attempts: 1 },
];

export const mockStats: DashboardStats = {
  totalEmployees: 10,
  presentToday: 8,
  absentToday: 1,
  lateArrivals: 2,
  remoteWorkers: 2,
  unauthorizedDevices: 3,
  attendanceRate: 89.4,
  avgCheckInTime: "08:42",
};

export const mockChartData: ChartDataPoint[] = [
  { date: "Mon", present: 42, absent: 5, late: 3, remote: 8 },
  { date: "Tue", present: 45, absent: 3, late: 2, remote: 9 },
  { date: "Wed", present: 38, absent: 8, late: 5, remote: 7 },
  { date: "Thu", present: 47, absent: 2, late: 1, remote: 11 },
  { date: "Fri", present: 40, absent: 4, late: 4, remote: 10 },
  { date: "Sat", present: 12, absent: 18, late: 1, remote: 3 },
  { date: "Sun", present: 3, absent: 27, late: 0, remote: 1 },
];

export const mockDepartments: Department[] = [
  { id: "dep1", name: "Engineering", headCount: 18, presentToday: 15, manager: "Amara Okonkwo" },
  { id: "dep2", name: "Product", headCount: 8, presentToday: 7, manager: "Chidi Eze" },
  { id: "dep3", name: "Design", headCount: 6, presentToday: 5, manager: "Fatima Al-Hassan" },
  { id: "dep4", name: "HR", headCount: 4, presentToday: 4, manager: "Ngozi Adeyemi" },
  { id: "dep5", name: "Finance", headCount: 5, presentToday: 3, manager: "Emeka Nwosu" },
  { id: "dep6", name: "Marketing", headCount: 7, presentToday: 6, manager: "Olumide Adebayo" },
  { id: "dep7", name: "Security", headCount: 4, presentToday: 4, manager: "Tunde Bakare" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", type: "warning", title: "Unauthorized Device Detected", message: "Unknown Android device attempted to connect 7 times from IP 192.168.1.210", timestamp: "2 min ago", read: false },
  { id: "n2", type: "info", title: "Late Arrival Alert", message: "Fatima Al-Hassan checked in at 09:55 — 55 minutes late", timestamp: "15 min ago", read: false },
  { id: "n3", type: "error", title: "Device Blocked", message: "Suspicious Tablet blocked after 34 failed auth attempts", timestamp: "2 hrs ago", read: false },
  { id: "n4", type: "success", title: "New User Registered", message: "Olumide Adebayo registered their tablet for approval", timestamp: "3 hrs ago", read: true },
  { id: "n5", type: "info", title: "System Backup Complete", message: "Weekly attendance backup successfully completed", timestamp: "Yesterday", read: true },
];

// ── Extended analytics data ──────────────────────────────────

export interface HeatmapCell {
  day: string;   // "Mon" – "Sun"
  hour: number;  // 0-23
  value: number; // 0-10 activity score
}

export interface TrendPoint {
  date: string;
  rate: number;
  present: number;
  late: number;
  absent: number;
  avgHours: number;
}

export interface LateArrival {
  id: string;
  name: string;
  department: string;
  date: string;
  scheduledTime: string;
  actualTime: string;
  minutesLate: number;
  occurrences: number;
  avatarColor: string;
}

export interface ProductivityScore {
  department: string;
  score: number;
  trend: number;
  avgHours: number;
  attendanceRate: number;
}

// 30-day attendance trend
export const mockTrends: TrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2025, 3, 10 + i);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const base = isWeekend ? 20 : 85;
  const noise = (Math.random() - 0.5) * 12;
  const rate = Math.max(10, Math.min(100, Math.round(base + noise)));
  const total = 58;
  const present = Math.round((rate / 100) * total);
  const late = isWeekend ? 0 : Math.round(Math.random() * 5);
  const absent = total - present;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rate,
    present,
    late,
    absent,
    avgHours: isWeekend ? 0 : Math.round((7.5 + (Math.random() - 0.5)) * 10) / 10,
  };
});

// Productivity heatmap — hour × day intensity
export const mockHeatmap: HeatmapCell[] = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells: HeatmapCell[] = [];
  days.forEach(day => {
    const isWeekend = day === "Sat" || day === "Sun";
    for (let h = 0; h < 24; h++) {
      let value = 0;
      if (!isWeekend) {
        if (h >= 8 && h <= 9)  value = 7 + Math.round(Math.random() * 3);
        else if (h >= 10 && h <= 12) value = 8 + Math.round(Math.random() * 2);
        else if (h === 13) value = 4 + Math.round(Math.random() * 2); // lunch dip
        else if (h >= 14 && h <= 16) value = 8 + Math.round(Math.random() * 2);
        else if (h === 17) value = 6 + Math.round(Math.random() * 3);
        else if (h >= 18 && h <= 20) value = 2 + Math.round(Math.random() * 3);
        else value = Math.round(Math.random() * 1);
      } else {
        if (h >= 9 && h <= 14) value = Math.round(Math.random() * 3);
      }
      cells.push({ day, hour: h, value: Math.min(10, value) });
    }
  });
  return cells;
})();

// Late arrivals leaderboard
const avatarColors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500","bg-cyan-500","bg-pink-500"];
export const mockLateArrivals: LateArrival[] = [
  { id:"l1", name:"Fatima Al-Hassan", department:"Design",      date:"2025-05-09", scheduledTime:"09:00", actualTime:"09:55", minutesLate:55, occurrences:8,  avatarColor: avatarColors[2] },
  { id:"l2", name:"Kwame Asante",     department:"Engineering", date:"2025-05-08", scheduledTime:"09:00", actualTime:"09:38", minutesLate:38, occurrences:5,  avatarColor: avatarColors[3] },
  { id:"l3", name:"Emeka Nwosu",      department:"Finance",     date:"2025-05-07", scheduledTime:"09:00", actualTime:"09:22", minutesLate:22, occurrences:11, avatarColor: avatarColors[0] },
  { id:"l4", name:"Olumide Adebayo",  department:"Marketing",   date:"2025-05-06", scheduledTime:"09:00", actualTime:"09:18", minutesLate:18, occurrences:3,  avatarColor: avatarColors[4] },
  { id:"l5", name:"Chisom Obi",       department:"Operations",  date:"2025-05-05", scheduledTime:"09:00", actualTime:"09:12", minutesLate:12, occurrences:6,  avatarColor: avatarColors[1] },
];

// Department productivity scores
export const mockProductivity: ProductivityScore[] = [
  { department:"Engineering", score:92, trend:+3,  avgHours:8.7, attendanceRate:94 },
  { department:"Product",     score:88, trend:+1,  avgHours:8.2, attendanceRate:91 },
  { department:"Design",      score:84, trend:-2,  avgHours:7.9, attendanceRate:87 },
  { department:"HR",          score:97, trend:+5,  avgHours:8.1, attendanceRate:98 },
  { department:"Finance",     score:79, trend:-4,  avgHours:7.6, attendanceRate:82 },
  { department:"Marketing",   score:86, trend:+2,  avgHours:8.0, attendanceRate:89 },
  { department:"Security",    score:99, trend:0,   avgHours:9.1, attendanceRate:100 },
];
