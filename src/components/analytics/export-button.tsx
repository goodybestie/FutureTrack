"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockAttendance, mockUsers, mockTrends } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, FileText, FileSpreadsheet, Check, Loader2 } from "lucide-react";

function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportAttendanceCSV() {
  exportCSV("futuretrack_attendance.csv",
    mockAttendance.map(r => [
      r.userName, r.department, r.date,
      r.checkIn ?? "—", r.checkOut ?? "—",
      r.duration ?? "—", r.status, r.location,
    ]),
    ["Name","Department","Date","Check In","Check Out","Duration","Status","Location"]
  );
}

function exportUsersCSV() {
  exportCSV("futuretrack_users.csv",
    mockUsers.map(u => [u.name, u.email, u.role, u.status, u.department, u.employeeId, u.joinDate]),
    ["Name","Email","Role","Status","Department","Employee ID","Join Date"]
  );
}

function exportTrendsCSV() {
 exportCSV(
    "futuretrack_trends.csv",
    mockTrends.map(t => [
      t.date,
      `${t.rate}%`,
      String(t.present),
      String(t.late),
      String(t.absent),
      `${t.avgHours}h`,
    ]),
    ["Date", "Attendance Rate", "Present", "Late", "Absent", "Avg Hours"]
  );
}

function exportJSON() {
  const data = { attendance: mockAttendance, users: mockUsers, trends: mockTrends };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "futuretrack_export.json"; a.click();
  URL.revokeObjectURL(url);
}

interface ExportOption {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  accent: string;
}

const OPTIONS: ExportOption[] = [
  { key: "attendance", label: "Attendance Logs", description: "All check-in/out records as CSV", icon: FileSpreadsheet, action: exportAttendanceCSV, accent: "text-emerald-600 dark:text-emerald-400" },
  { key: "users",      label: "User Directory",  description: "All employees and roles as CSV",  icon: FileSpreadsheet, action: exportUsersCSV,      accent: "text-blue-600 dark:text-blue-400"    },
  { key: "trends",     label: "30-Day Trends",   description: "Attendance rate analytics CSV",   icon: FileSpreadsheet, action: exportTrendsCSV,     accent: "text-violet-600 dark:text-violet-400" },
  { key: "json",       label: "Full Data Export", description: "Complete JSON data dump",         icon: FileText,        action: exportJSON,           accent: "text-orange-600 dark:text-orange-400" },
];

export function ExportButton({ variant = "dropdown" }: { variant?: "dropdown" | "inline" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleExport = async (opt: ExportOption) => {
    setLoading(opt.key);
    await new Promise(r => setTimeout(r, 700));
    opt.action();
    setLoading(null);
    setDone(opt.key);
    setTimeout(() => { setDone(null); setOpen(false); }, 1500);
  };

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isLoading = loading === opt.key;
          const isDone = done === opt.key;
          return (
            <Button key={opt.key} variant="outline" size="sm"
              icon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isDone ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Icon className={cn("w-3.5 h-3.5", opt.accent)} />}
              onClick={() => handleExport(opt)}
              disabled={!!loading}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm"
        icon={<Download className="w-3.5 h-3.5" />}
        onClick={() => setOpen(s => !s)}
      >
        Export
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-card-hover z-40 overflow-hidden py-1"
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Export Data
              </p>
              {OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isLoading = loading === opt.key;
                const isDone = done === opt.key;
                return (
                  <button key={opt.key} onClick={() => handleExport(opt)} disabled={!!loading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors disabled:opacity-50">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> :
                       isDone    ? <Check className="w-3.5 h-3.5 text-emerald-500" /> :
                       <Icon className={cn("w-3.5 h-3.5", opt.accent)} />}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-medium text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
