"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDetectionStore, useToastQueue } from "@/stores/detection-store";
import { cn } from "@/lib/utils";
import { X, ShieldAlert, ShieldCheck, Info, CheckCircle, AlertTriangle } from "lucide-react";
import type { ToastNotification } from "@/lib/detection-engine/types";

const toastConfig = {
  threat: {
    icon: ShieldAlert,
    bar: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800/60",
    icon_class: "text-red-600 dark:text-red-400",
    title_class: "text-red-800 dark:text-red-200",
    text_class: "text-red-700 dark:text-red-300" },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800/60",
    icon_class: "text-amber-600 dark:text-amber-400",
    title_class: "text-amber-800 dark:text-amber-200",
    text_class: "text-amber-700 dark:text-amber-300" },
  blocked: {
    icon: ShieldAlert,
    bar: "bg-slate-500",
    bg: "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700",
    icon_class: "text-slate-600 dark:text-slate-400",
    title_class: "text-slate-800 dark:text-slate-200",
    text_class: "text-slate-600 dark:text-slate-400" },
  approved: {
    icon: ShieldCheck,
    bar: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800/60",
    icon_class: "text-emerald-600 dark:text-emerald-400",
    title_class: "text-emerald-800 dark:text-emerald-200",
    text_class: "text-emerald-700 dark:text-emerald-300" },
  success: {
    icon: CheckCircle,
    bar: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800/60",
    icon_class: "text-emerald-600 dark:text-emerald-400",
    title_class: "text-emerald-800 dark:text-emerald-200",
    text_class: "text-emerald-700 dark:text-emerald-300" },
  info: {
    icon: Info,
    bar: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800/60",
    icon_class: "text-blue-600 dark:text-blue-400",
    title_class: "text-blue-800 dark:text-blue-200",
    text_class: "text-blue-700 dark:text-blue-300" } };

function ToastItem({ toast }: { toast: ToastNotification }) {
  const { dismissToast } = useDetectionStore();
  const cfg = toastConfig[toast.type] ?? toastConfig.info;
  const Icon = cfg.icon;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast.dismissAfterMs) {
      timerRef.current = setTimeout(() => dismissToast(toast.id), toast.dismissAfterMs);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.dismissAfterMs, dismissToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className={cn(
        "relative w-80 rounded-xl border shadow-lg overflow-hidden backdrop-blur-sm",
        cfg.bg
      )}
    >
      {/* Threat level bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", cfg.bar)} />

      {/* Auto-dismiss progress */}
      {toast.dismissAfterMs && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.dismissAfterMs / 1000, ease: "linear" }}
          className={cn("absolute bottom-0 left-0 right-0 h-0.5 origin-left", cfg.bar, "opacity-40")}
        />
      )}

      <div className="flex items-start gap-3 p-3.5 pl-4">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          toast.type === "threat" ? "bg-red-100 dark:bg-red-900/50" :
          toast.type === "approved" || toast.type === "success" ? "bg-emerald-100 dark:bg-emerald-900/50" :
          toast.type === "warning" ? "bg-amber-100 dark:bg-amber-900/50" :
          "bg-current/10"
        )}>
          <Icon className={cn("w-4 h-4", cfg.icon_class)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-bold leading-tight", cfg.title_class)}>{toast.title}</p>
          <p className={cn("text-xs leading-snug mt-0.5 line-clamp-2", cfg.text_class)}>
            {toast.message}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {new Date(toast.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>

        <button
          onClick={() => dismissToast(toast.id)}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 mt-0.5"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastQueue();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 5).map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
