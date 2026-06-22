"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSessions } from "@/stores/wifi-store";
import { ConnectionBadge, AttendanceBadge } from "./connection-badge";
import { SignalIcon } from "./signal-icon";
import { LiveDuration } from "./live-duration";
import { cn, getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Clock } from "lucide-react";

type SortKey = "name" | "status" | "checkIn" | "duration" | "connection";

export function AttendanceSummaryTable() {
  const sessions = useSessions();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("connection");
  const [asc, setAsc] = useState(false);

  const filtered = sessions.filter(s =>
    s.userName.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sort === "name")       cmp = a.userName.localeCompare(b.userName);
    if (sort === "status")     cmp = a.attendanceStatus.localeCompare(b.attendanceStatus);
    if (sort === "connection") {
      const order = { connected: 0, connecting: 1, reconnecting: 2, disconnecting: 3, offline: 4 };
      cmp = (order[a.connectionState] ?? 5) - (order[b.connectionState] ?? 5);
    }
    if (sort === "checkIn") {
      const at = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const bt = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      cmp = at - bt;
    }
    return asc ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc(a => !a);
    else { setSort(key); setAsc(true); }
  }

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={cn("w-3 h-3 transition-opacity", sort === col ? "opacity-100 text-primary" : "opacity-40")} />
    </button>
  );

  return (
    <div>
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search employee or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="max-w-xs"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left"><SortBtn col="name" label="Employee" /></th>
              <th className="px-4 py-2.5 text-left"><SortBtn col="connection" label="Connection" /></th>
              <th className="px-4 py-2.5 text-left"><SortBtn col="status" label="Attendance" /></th>
              <th className="px-4 py-2.5 text-left"><SortBtn col="checkIn" label="Check-in" /></th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Duration</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Signal</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((s, i) => (
              <motion.tr
                key={s.userId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "hover:bg-muted/20 transition-colors",
                  s.connectionState === "connected" && "bg-emerald-50/20 dark:bg-emerald-950/5"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", s.avatarColor)}>
                      {getInitials(s.userName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.userName}</p>
                      <p className="text-xs text-muted-foreground">{s.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ConnectionBadge state={s.connectionState} size="xs" />
                </td>
                <td className="px-4 py-3">
                  <AttendanceBadge status={s.attendanceStatus} size="xs" />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono-custom text-foreground">
                    {s.checkInTime
                      ? new Date(s.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                      : <span className="text-muted-foreground">—</span>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <LiveDuration session={s} className="text-xs" pulse />
                </td>
                <td className="px-4 py-3">
                  {s.connectionState !== "offline"
                    ? <SignalIcon dbm={s.signalStrength} />
                    : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground truncate max-w-[110px] block">
                    {s.connectionState !== "offline" ? s.location : "—"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden divide-y divide-border">
        {sorted.map(s => (
          <div key={s.userId} className="px-4 py-3.5 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0", s.avatarColor)}>
              {getInitials(s.userName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">{s.userName}</p>
                <ConnectionBadge state={s.connectionState} size="xs" />
              </div>
              <div className="flex gap-2 mt-1 flex-wrap items-center">
                <AttendanceBadge status={s.attendanceStatus} size="xs" />
                {s.checkInTime && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(s.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                <LiveDuration session={s} className="text-[10px] text-muted-foreground" />
              </div>
            </div>
            {s.connectionState !== "offline" && (
              <SignalIcon dbm={s.signalStrength} size="sm" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
