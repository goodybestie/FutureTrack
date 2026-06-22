"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bell, X, Check, ShieldAlert, Clock, Wifi, Info, CheckCircle, AlertTriangle } from "lucide-react";

export type NotifType = "threat" | "late" | "checkin" | "checkout" | "info" | "success" | "warning";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Simple module-level store (avoids Zustand overhead for small state)
let _notifications: AppNotification[] = [
  { id: "boot-1", type: "threat",   title: "Unauthorized Device", message: "Kali-Linux-Box detected — port scanning active", timestamp: new Date(Date.now() - 3 * 60000), read: false },
  { id: "boot-2", type: "late",     title: "Late Arrival",        message: "Fatima Al-Hassan checked in 55 minutes late", timestamp: new Date(Date.now() - 12 * 60000), read: false },
  { id: "boot-3", type: "checkin",  title: "Check-in",            message: "8 employees checked in this morning", timestamp: new Date(Date.now() - 25 * 60000), read: true },
  { id: "boot-4", type: "success",  title: "Backup Complete",     message: "Weekly attendance data backed up successfully", timestamp: new Date(Date.now() - 60 * 60000), read: true },
];
let _listeners: (() => void)[] = [];

function notifyAll() { _listeners.forEach(fn => fn()); }

export function pushNotification(n: Omit<AppNotification, "id" | "read" | "timestamp">) {
  _notifications = [
    { ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, read: false, timestamp: new Date() },
    ..._notifications,
  ].slice(0, 50);
  notifyAll();
}

function useNotifications() {
  const [notifs, setNotifs] = useState(_notifications);
  useEffect(() => {
    const fn = () => setNotifs([..._notifications]);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);
  return notifs;
}

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  threat:   { icon: ShieldAlert,   color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-950/40" },
  late:     { icon: Clock,         color: "text-amber-600 dark:text-amber-400",bg: "bg-amber-50 dark:bg-amber-950/40" },
  checkin:  { icon: Wifi,          color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  checkout: { icon: Wifi,          color: "text-slate-500",                    bg: "bg-slate-100 dark:bg-slate-800" },
  info:     { icon: Info,          color: "text-blue-600 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-950/40" },
  success:  { icon: CheckCircle,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  warning:  { icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" } };

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export function NotificationBell() {
  const notifs = useNotifications();
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    _notifications = _notifications.map(n => ({ ...n, read: true }));
    notifyAll();
  };

  const markRead = (id: string) => {
    _notifications = _notifications.map(n => n.id === id ? { ...n, read: true } : n);
    notifyAll();
  };

  const remove = (id: string) => {
    _notifications = _notifications.filter(n => n.id !== id);
    notifyAll();
  };

  // Auto-inject realistic notifications every ~20s
  useEffect(() => {
    const pool = [
      { type: "checkin"  as NotifType, title: "Employee Online",     message: "Aisha Bello connected to FutureTrack-Corp-5GHz" },
      { type: "late"     as NotifType, title: "Late Arrival Alert",   message: "Olumide Adebayo checked in 18 minutes late" },
      { type: "threat"   as NotifType, title: "Unknown Device",       message: "New unauthorized device detected on 192.168.2.44" },
      { type: "checkout" as NotifType, title: "Employee Left",        message: "Kwame Asante disconnected — session: 6h 28m" },
      { type: "info"     as NotifType, title: "System Heartbeat",     message: "All 4 network sensors reporting normally" },
    ];
    let i = 0;
    const t = setInterval(() => {
      pushNotification(pool[i % pool.length]);
      i++;
    }, 22000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(s => !s)}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unread > 0 && (
          <motion.span
            key={unread}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-card-hover z-40 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold font-display">Notifications</span>
                  {unread > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="text-[10px] text-primary hover:underline px-2 py-1">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-border">
                <AnimatePresence initial={false}>
                  {notifs.slice(0, 20).map(n => {
                    const cfg = typeConfig[n.type];
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group",
                          !n.read && "bg-primary/2"
                        )}
                        onClick={() => markRead(n.id)}
                      >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                          <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(n.timestamp)}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); remove(n.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:bg-muted shrink-0 mt-1"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {notifs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell className="w-6 h-6 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">All caught up!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
