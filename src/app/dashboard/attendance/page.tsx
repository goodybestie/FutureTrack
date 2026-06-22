"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { mockAttendance } from "@/data/mock";
import { capitalizeFirst } from "@/lib/utils";
import { Search, Download, Clock, MapPin, ClipboardList, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { AttendanceStatus } from "@/types";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "early-leave", label: "Early Leave" },
  { value: "remote", label: "Remote" },
];

const deptOptions = [
  { value: "all", label: "All Departments" },
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "HR", label: "HR" },
  { value: "Finance", label: "Finance" },
];

const statusVariant = (status: AttendanceStatus) => {
  const map: Record<AttendanceStatus, any> = {
    present: "success", absent: "danger", late: "warning",
    "early-leave": "warning", remote: "info" };
  return map[status] ?? "neutral";
};

export default function AttendancePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = mockAttendance.filter(r => {
    const matchSearch = r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchDept = deptFilter === "all" || r.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const summaryStats = {
    present: mockAttendance.filter(r => r.status === "present").length,
    absent: mockAttendance.filter(r => r.status === "absent").length,
    late: mockAttendance.filter(r => r.status === "late").length,
    remote: mockAttendance.filter(r => r.status === "remote").length };

  return (
    <DashboardLayout title="Attendance Logs" subtitle="Complete history & real-time tracking">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {Object.entries(summaryStats).map(([key, val], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3"
          >
            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-primary/60 to-primary/20" />
            <div>
              <p className="text-xl font-bold font-display tabular-nums">{val}</p>
              <p className="text-xs text-muted-foreground capitalize">{key}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-border">
          <Input
            placeholder="Search by name or department…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            icon={<Search className="w-4 h-4" />}
            className="flex-1 min-w-[200px]"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-40"
          />
          <Select
            options={deptOptions}
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="w-44"
          />
          <Button variant="outline" size="sm" icon={<CalendarDays className="w-3.5 h-3.5" />}>Date Range</Button>
          <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Export</Button>
        </div>

        {/* Table */}
        {paginated.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-6 h-6" />}
            title="No records found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Employee", "Department", "Date", "Check In", "Check Out", "Duration", "Location", "Status"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((record, i) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={record.userName} size="xs" />
                          <span className="text-sm font-medium text-foreground">{record.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{record.department}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono-custom">{record.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-custom text-foreground">{record.checkIn ?? <span className="text-muted-foreground">—</span>}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-custom text-foreground">{record.checkOut ?? <span className="text-muted-foreground">—</span>}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${record.duration === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                          {record.duration ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[100px]">{record.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(record.status)} dot>
                          {capitalizeFirst(record.status)}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-border">
              {paginated.map((record) => (
                <div key={record.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={record.userName} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{record.userName}</p>
                        <p className="text-xs text-muted-foreground">{record.department}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(record.status)} dot>{capitalizeFirst(record.status)}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{record.checkIn ?? "—"} – {record.checkOut ?? "Active"}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{record.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "primary" : "ghost"}
                  size="xs"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
