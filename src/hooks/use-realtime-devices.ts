"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import type { UnauthorizedDeviceRow, DeviceSessionWithUser } from "@/types/database";

interface DeviceState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Subscribes to unauthorized device changes in real time.
 * Emits a browser notification on new threats if the browser supports it.
 */
export function useRealtimeUnauthorizedDevices(enabled = true) {
  const supabase = useSupabase();

  const [state, setState] = useState<DeviceState<UnauthorizedDeviceRow>>({
    data: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("unauthorized_devices")
      .select("*")
      .order("detected_at", { ascending: false });

    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
    } else {
      setState({ data: data ?? [], loading: false, error: null, lastUpdated: new Date() });
    }
  }, [supabase]);

  useEffect(() => {
    if (!enabled) return;
    fetch();

    const channel = supabase
      .channel("unauthorized-devices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "unauthorized_devices" },
        (payload) => {
          // Alert on new unauthorized device
          if (payload.eventType === "INSERT") {
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              new Notification("⚠️ FutureTrack Alert", {
                body: `Unauthorized device detected: ${(payload.new as UnauthorizedDeviceRow).device_name}`,
                icon: "/favicon.ico",
              });
            }
          }
          fetch();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [enabled, fetch, supabase]);

  return { ...state, refetch: fetch };
}

/**
 * Subscribes to connected device session changes.
 */
export function useRealtimeDeviceSessions(enabled = true) {
  const supabase = useSupabase();

  const [state, setState] = useState<DeviceState<DeviceSessionWithUser>>({
    data: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("device_sessions")
      .select(`*, users (id, full_name, email)`)
      .order("last_seen", { ascending: false });

    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
    } else {
      setState({ data: (data as DeviceSessionWithUser[]) ?? [], loading: false, error: null, lastUpdated: new Date() });
    }
  }, [supabase]);

  useEffect(() => {
    if (!enabled) return;
    fetch();

    const channel = supabase
      .channel("device-sessions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_sessions" },
        () => fetch()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [enabled, fetch, supabase]);

  return { ...state, refetch: fetch };
}
