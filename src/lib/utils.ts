import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserRole, UserStatus, AttendanceStatus, DeviceStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getStatusColor(status: AttendanceStatus): string {
  const map: Record<AttendanceStatus, string> = {
    "present": "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
    "absent": "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
    "late": "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
    "early-leave": "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/40",
    "remote": "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  };
  return map[status] ?? "";
}

export function getDeviceStatusColor(status: DeviceStatus): string {
  const map: Record<DeviceStatus, string> = {
    "authorized": "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
    "unauthorized": "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
    "pending": "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
    "blocked": "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/60",
  };
  return map[status] ?? "";
}

export function getUserStatusColor(status: UserStatus): string {
  const map: Record<UserStatus, string> = {
    "active": "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
    "inactive": "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50",
    "suspended": "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
  };
  return map[status] ?? "";
}

export function getRoleColor(role: UserRole): string {
  const map: Record<UserRole, string> = {
    "admin": "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40",
    "manager": "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
    "staff": "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50",
    "security": "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/40",
  };
  return map[role] ?? "";
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");
}

export function getAvatarBg(name: string): string {
  const colors = [
    "bg-blue-500", "bg-violet-500", "bg-emerald-500",
    "bg-orange-500", "bg-cyan-500", "bg-pink-500",
    "bg-indigo-500", "bg-teal-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
