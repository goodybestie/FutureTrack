"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { mockUsers } from "@/data/mock";
import { capitalizeFirst, cn, getInitials, getAvatarBg } from "@/lib/utils";
import type { User, UserRole, UserStatus } from "@/types";
import { Search, UserPlus, Users, MoreHorizontal, Edit, Trash2, Shield, KeyRound, Download, X, Eye, EyeOff, AlertTriangle, Mail, Phone, Building2, CreditCard, Lock, CheckCircle, User as UserIcon } from "lucide-react";

// ── Types ────────────────────────────────────────────────────
type ModalType = "add" | "edit" | "view" | "delete" | "resetPassword" | "permissions" | null;

interface ModalState {
  type: ModalType;
  user: User | null;
}

// ── Helpers ──────────────────────────────────────────────────
const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "security", label: "Security" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const roleVariant = (role: UserRole): any => {
  const map: Record<UserRole, any> = {
    admin: "danger", manager: "info", staff: "neutral", security: "warning" };
  return map[role] ?? "neutral";
};

const statusVariant = (status: UserStatus): any => {
  const map: Record<UserStatus, any> = {
    active: "success", inactive: "neutral", suspended: "danger" };
  return map[status] ?? "neutral";
};

// ── Modal Backdrop ────────────────────────────────────────────
function ModalBackdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  // Close on Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          className="relative z-10 w-full max-w-lg"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Add / Edit User Modal ─────────────────────────────────────
function UserFormModal({
  user,
  mode,
  onClose,
  onSave }: {
  user: User | null;
  mode: "add" | "edit";
  onClose: () => void;
  onSave: (data: Partial<User> & { password?: string }) => void;
}) {
  const [form, setForm] = useState({
    name:       user?.name        ?? "",
    email:      user?.email       ?? "",
    role:       user?.role        ?? "staff" as UserRole,
    status:     user?.status      ?? "active" as UserStatus,
    department: user?.department  ?? "",
    employeeId: user?.employeeId  ?? "",
    phone:      user?.phone       ?? "",
    password:   "",
    confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())       errs.name = "Full name is required";
    if (!form.email.trim())      errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.department.trim()) errs.department = "Department is required";
    if (!form.employeeId.trim()) errs.employeeId = "Employee ID is required";
    if (mode === "add") {
      if (!form.password)        errs.password = "Password is required";
      else if (form.password.length < 8) errs.password = "Minimum 8 characters";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Core save logic — no event dependency, so it can be called from
  // either the <form onSubmit> handler or the footer button's onClick
  // without any event-type mismatch or `as any` cast.
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate API
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { onSave(form); onClose(); }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  const roleSelectOptions = [
    { value: "admin",    label: "Admin" },
    { value: "manager",  label: "Manager" },
    { value: "staff",    label: "Staff" },
    { value: "security", label: "Security" },
  ];

  const statusSelectOptions = [
    { value: "active",    label: "Active" },
    { value: "inactive",  label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const deptOptions = [
    { value: "Engineering", label: "Engineering" },
    { value: "Product",     label: "Product" },
    { value: "Design",      label: "Design" },
    { value: "HR",          label: "HR" },
    { value: "Finance",     label: "Finance" },
    { value: "Marketing",   label: "Marketing" },
    { value: "Security",    label: "Security" },
    { value: "Operations",  label: "Operations" },
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              {mode === "add" ? <UserPlus className="w-4 h-4 text-primary" /> : <Edit className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-foreground">
                {mode === "add" ? "Add New User" : "Edit User"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mode === "add" ? "Create a new team member account" : `Editing ${user?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="e.g. Amara Okonkwo"
                  className={cn(
                    "w-full h-9 bg-background border rounded-lg pl-9 pr-3 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50",
                    errors.name ? "border-destructive" : "border-border"
                  )}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="name@company.com"
                  className={cn(
                    "w-full h-9 bg-background border rounded-lg pl-9 pr-3 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50",
                    errors.email ? "border-destructive" : "border-border"
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Employee ID + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={e => set("employeeId", e.target.value)}
                  placeholder="e.g. EMP011"
                  className={cn(
                    "w-full h-9 bg-background border rounded-lg pl-9 pr-3 text-sm font-mono-custom",
                    "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50",
                    errors.employeeId ? "border-destructive" : "border-border"
                  )}
                />
              </div>
              {errors.employeeId && <p className="text-xs text-destructive mt-1">{errors.employeeId}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full h-9 bg-background border border-border rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>

          {/* Department + Role + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={form.department}
                  onChange={e => set("department", e.target.value)}
                  className={cn(
                    "w-full h-9 bg-background border rounded-lg pl-9 pr-3 text-sm appearance-none",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.department ? "border-destructive" : "border-border"
                  )}
                >
                  <option value="">Select dept…</option>
                  {deptOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={e => set("role", e.target.value)}
                className="w-full h-9 bg-background border border-border rounded-lg px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {roleSelectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full h-9 bg-background border border-border rounded-lg px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statusSelectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Password (add mode only) */}
          {mode === "add" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    className={cn(
                      "w-full h-9 bg-background border rounded-lg pl-9 pr-9 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50",
                      errors.password ? "border-destructive" : "border-border"
                    )}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)}
                    placeholder="Repeat password"
                    className={cn(
                      "w-full h-9 bg-background border rounded-lg pl-9 pr-3 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50",
                      errors.confirmPassword ? "border-destructive" : "border-border"
                    )}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={loading}
            onClick={() => { void submit(); }}
            icon={success ? <CheckCircle className="w-3.5 h-3.5" /> : undefined}
            className={success ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {success ? "Saved!" : mode === "add" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── View User Modal ───────────────────────────────────────────
function ViewUserModal({ user, onClose, onEdit }: { user: User; onClose: () => void; onEdit: () => void }) {
  const rows = [
    { label: "Employee ID", value: user.employeeId, mono: true },
    { label: "Email",       value: user.email },
    { label: "Department",  value: user.department },
    { label: "Phone",       value: user.phone ?? "—" },
    { label: "Join Date",   value: user.joinDate },
    { label: "Last Seen",   value: user.lastSeen ?? "—" },
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold font-display">User Profile</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold", getAvatarBg(user.name))}>
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold font-display text-foreground">{user.name}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Badge variant={roleVariant(user.role)}>{capitalizeFirst(user.role)}</Badge>
                <Badge variant={statusVariant(user.status)} dot>{capitalizeFirst(user.status)}</Badge>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-0 divide-y divide-border">
            {rows.map(r => (
              <div key={r.label} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-muted-foreground w-28 shrink-0">{r.label}</span>
                <span className={cn("text-xs text-foreground text-right", r.mono && "font-mono-custom")}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" icon={<Edit className="w-3.5 h-3.5" />} onClick={onEdit}>
            Edit User
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({ user, onClose, onConfirm }: { user: User; onClose: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const isMatch = inputVal === user.name;

  const handle = async () => {
    if (!isMatch) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    setConfirmed(true);
    setTimeout(() => { onConfirm(); onClose(); }, 800);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-base font-bold font-display text-foreground text-center mb-1">Delete User Account</h2>
          <p className="text-xs text-muted-foreground text-center mb-5">
            This will permanently delete <span className="font-semibold text-foreground">{user.name}</span>{`'s account and all their attendance records. This action cannot be undone.`}
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Type <span className="font-mono-custom font-bold text-foreground">{user.name}</span> to confirm
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={user.name}
              autoFocus
              className={cn(
                "w-full h-9 bg-background border rounded-lg px-3 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-destructive/40 placeholder:text-muted-foreground/40",
                isMatch ? "border-emerald-500" : "border-border"
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!isMatch}
            loading={loading}
            icon={confirmed ? <CheckCircle className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
            onClick={handle}
          >
            {confirmed ? "Deleted!" : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Reset Password Modal ──────────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Core logic separated from the event so it can be invoked from
  // either the form's onSubmit or the footer button's onClick with
  // correct, distinct event types and no `as any` cast.
  const submit = async () => {
    if (form.password.length < 8) { setError("Minimum 8 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display">Reset Password</h2>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-foreground">Password reset successfully</p>
              <p className="text-xs text-muted-foreground mt-1">The user will be notified by email</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full h-9 bg-background border border-border rounded-lg pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat password"
                    className="w-full h-9 bg-background border border-border rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {!done && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" loading={loading} onClick={() => { void submit(); }} icon={<KeyRound className="w-3.5 h-3.5" />}>
              Reset Password
            </Button>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
}

// ── Permissions Modal ─────────────────────────────────────────
function PermissionsModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setSaved(true);
    setTimeout(() => { onSave(role); onClose(); }, 800);
  };

  const roles: { key: UserRole; label: string; description: string; color: string }[] = [
    { key: "admin",    label: "Admin",    description: "Full access to all features, users, and settings", color: "border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/10" },
    { key: "manager",  label: "Manager",  description: "Can view all reports and manage team attendance",  color: "border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/10" },
    { key: "security", label: "Security", description: "Access to device management and threat monitoring", color: "border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/10" },
    { key: "staff",    label: "Staff",    description: "Can view own attendance records only",              color: "border-border bg-muted/20" },
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-50 dark:bg-violet-950/40 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display">Manage Permissions</h2>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-2.5">
          <p className="text-xs text-muted-foreground mb-3">Select a role to define what this user can access.</p>
          {roles.map(r => (
            <button key={r.key} type="button"
              onClick={() => setRole(r.key)}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                role === r.key ? r.color + " border-primary/40" : "border-border hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                role === r.key ? "border-primary bg-primary" : "border-muted-foreground/40"
              )}>
                {role === r.key && <span className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
              </div>
              {r.key === user.role && (
                <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                  current
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={loading}
            icon={saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            onClick={handle}>
            {saved ? "Saved!" : "Save Permissions"}
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Row Action Menu ───────────────────────────────────────────
function RowActionMenu({ user, onAction }: {
  user: User;
  onAction: (type: ModalType) => void;
}) {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: Eye,          label: "View Profile",    type: "view"          as ModalType, color: "" },
    { icon: Edit,         label: "Edit User",       type: "edit"          as ModalType, color: "" },
    { icon: Shield,       label: "Permissions",     type: "permissions"   as ModalType, color: "text-violet-600 dark:text-violet-400" },
    { icon: KeyRound,     label: "Reset Password",  type: "resetPassword" as ModalType, color: "text-amber-600 dark:text-amber-400" },
    { icon: Trash2,       label: "Delete User",     type: "delete"        as ModalType, color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(s => !s)}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-card-hover w-44 py-1 overflow-hidden"
            >
              {actions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.type}
                    onClick={() => { onAction(a.type); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-muted transition-colors text-left",
                      i === actions.length - 1 && "border-t border-border mt-1 pt-2",
                      a.color || "text-foreground"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", a.color || "text-muted-foreground")} />
                    {a.label}
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

// ── Main Page ─────────────────────────────────────────────────
export default function UsersPage() {
  // Local users state (mirrors mockUsers so CRUD reflects immediately)
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected]       = useState<string[]>([]);
  const [modal, setModal]             = useState<ModalState>({ type: null, user: null });

  const openModal = (type: ModalType, user: User | null = null) =>
    setModal({ type, user });
  const closeModal = () => setModal({ type: null, user: null });

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.employeeId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);
    const matchRole   = roleFilter   === "all" || u.role   === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleSelect  = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll     = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(u => u.id));

  // CRUD handlers
  const handleAddUser = (data: Partial<User>) => {
    const newUser: User = {
      id:           `u${Date.now()}`,
      name:         data.name        ?? "",
      email:        data.email       ?? "",
      role:         (data.role       ?? "staff") as UserRole,
      status:       (data.status     ?? "active") as UserStatus,
      department:   data.department  ?? "",
      employeeId:   data.employeeId  ?? "",
      phone:        data.phone       ?? "",
      joinDate:     new Date().toISOString().split("T")[0],
      lastSeen:     "Just now" };
    setUsers(p => [newUser, ...p]);
  };

  const handleEditUser = (data: Partial<User>) => {
    if (!modal.user) return;
    setUsers(p => p.map(u => u.id === modal.user!.id ? { ...u, ...data } : u));
  };

  const handleDeleteUser = () => {
    if (!modal.user) return;
    setUsers(p => p.filter(u => u.id !== modal.user!.id));
    setSelected(p => p.filter(id => id !== modal.user!.id));
  };

  const handleDeleteSelected = async () => {
    setUsers(p => p.filter(u => !selected.includes(u.id)));
    setSelected([]);
  };

  const handlePermissions = (role: UserRole) => {
    if (!modal.user) return;
    setUsers(p => p.map(u => u.id === modal.user!.id ? { ...u, role } : u));
  };

  const handleExport = () => {
    const rows = [
      ["Name","Email","Role","Status","Department","Employee ID","Join Date"],
      ...users.map(u => [u.name, u.email, u.role, u.status, u.department, u.employeeId, u.joinDate]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "futuretrack_users.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total:     users.length,
    active:    users.filter(u => u.status === "active").length,
    inactive:  users.filter(u => u.status === "inactive").length,
    suspended: users.filter(u => u.status === "suspended").length };

  return (
    <DashboardLayout title="User Management" subtitle="Manage team members and permissions">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Users", val: stats.total,     color: "text-foreground" },
          { label: "Active",      val: stats.active,    color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Inactive",    val: stats.inactive,  color: "text-muted-foreground" },
          { label: "Suspended",   val: stats.suspended, color: "text-red-500" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className={`text-2xl font-bold font-display tabular-nums ${s.color}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Card padding="none">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, ID, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 bg-background border border-border rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
            />
          </div>

          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="h-9 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-36">
            {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-36">
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex gap-2 ml-auto">
            {selected.length > 0 && (
              <Button variant="outline" size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                className="text-red-500 hover:border-red-300"
                onClick={handleDeleteSelected}>
                Delete ({selected.length})
              </Button>
            )}
            <Button variant="outline" size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExport}>
              Export
            </Button>
            <Button size="sm"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => openModal("add")}>
              Add User
            </Button>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No users found"
            description="Try adjusting your search or filters."
            action={
              <Button size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => openModal("add")}>
                Add First User
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-left w-10">
                      <input type="checkbox" className="rounded cursor-pointer"
                        checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={toggleAll} />
                    </th>
                    {["Employee","ID","Department","Role","Status","Joined",""].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((user, i) => (
                      <motion.tr key={user.id} layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/20 transition-colors group cursor-pointer"
                        onClick={() => openModal("view", user)}
                      >
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="rounded cursor-pointer"
                            checked={selected.includes(user.id)}
                            onChange={() => toggleSelect(user.id)} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", getAvatarBg(user.name))}>
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono-custom text-muted-foreground">{user.employeeId}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.department}</td>
                        <td className="px-4 py-3">
                          <Badge variant={roleVariant(user.role)}>{capitalizeFirst(user.role)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(user.status)} dot>{capitalizeFirst(user.status)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{user.joinDate}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {/* Quick inline edit button */}
                            <button
                              title="Edit"
                              onClick={e => { e.stopPropagation(); openModal("edit", user); }}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-all"
                            >
                              <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <RowActionMenu user={user} onAction={type => openModal(type, user)} />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filtered.map(user => (
                  <motion.div key={user.id} layout exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => openModal("view", user)}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0", getAvatarBg(user.name))}>
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant={roleVariant(user.role)} className="text-[10px]">{capitalizeFirst(user.role)}</Badge>
                        <Badge variant={statusVariant(user.status)} dot className="text-[10px]">{capitalizeFirst(user.status)}</Badge>
                        <span className="text-[10px] text-muted-foreground">{user.department}</span>
                      </div>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <RowActionMenu user={user} onAction={type => openModal(type, user)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/5">
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {users.length} users
          </p>
          {selected.length > 0 && (
            <p className="text-xs text-primary font-medium">{selected.length} selected</p>
          )}
        </div>
      </Card>

      {/* ── Modals ── */}
      {modal.type === "add" && (
        <UserFormModal mode="add" user={null} onClose={closeModal} onSave={handleAddUser} />
      )}
      {modal.type === "edit" && modal.user && (
        <UserFormModal mode="edit" user={modal.user} onClose={closeModal} onSave={handleEditUser} />
      )}
      {modal.type === "view" && modal.user && (
        <ViewUserModal
          user={modal.user}
          onClose={closeModal}
          onEdit={() => setModal({ type: "edit", user: modal.user })}
        />
      )}
      {modal.type === "delete" && modal.user && (
        <DeleteModal user={modal.user} onClose={closeModal} onConfirm={handleDeleteUser} />
      )}
      {modal.type === "resetPassword" && modal.user && (
        <ResetPasswordModal user={modal.user} onClose={closeModal} />
      )}
      {modal.type === "permissions" && modal.user && (
        <PermissionsModal user={modal.user} onClose={closeModal} onSave={handlePermissions} />
      )}
    </DashboardLayout>
  );
}
