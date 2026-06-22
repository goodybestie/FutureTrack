"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import type { AttendanceLogWithUser } from "@/types/database";

interface UseRealtimeAttendanceOptions {
  date?: string; // YYYY-MM-DD, defaults to today
  enabled?: boolean;
}

interface AttendanceState {
  data: AttendanceLogWithUser[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Subscribes to live attendance log changes for a given date.
 * Automatically updates when any row is inserted, updated, or deleted.
 */
export function useRealtimeAttendance(options: UseRealtimeAttendanceOptions = {}) {
  const supabase = useSupabase();
  const today = new Date().toISOString().split("T")[0];
  const targetDate = options.date ?? today;
  const enabled = options.enabled ?? true;

  const [state, setState] = useState<AttendanceState>({
    data: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("attendance_logs")
      .select(`*, users (id, full_name, email, department, avatar_url)`)
      .eq("date", targetDate)
      .order("check_in", { ascending: false });

    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
    } else {
      setState({
        data: (data as AttendanceLogWithUser[]) ?? [],
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    }
  }, [supabase, targetDate]);

  useEffect(() => {
    if (!enabled) return;

    fetchLogs();

    const channel = supabase
      .channel(`attendance-realtime-${targetDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_logs",
          filter: `date=eq.${targetDate}`,
        },
        (payload) => {
          // Re-fetch to get joined user data
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, targetDate, fetchLogs, supabase]);

  return { ...state, refetch: fetchLogs };
}
