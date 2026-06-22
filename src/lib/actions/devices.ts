"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DeviceSessionWithUser, UnauthorizedDeviceRow } from "@/types/database";

export interface DeviceActionResult {
  error?: string;
  success?: boolean;
  data?: unknown;
}

// ── Device Sessions ──────────────────────────────────────────

export async function getDeviceSessions(): Promise<{
  data: DeviceSessionWithUser[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("device_sessions")
    .select(`*, users (id, full_name, email)`)
    .order("last_seen", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data as DeviceSessionWithUser[]) ?? [] };
}

export async function registerDevice(payload: {
  deviceName: string;
  deviceIp?: string;
  macAddress?: string;
  os?: string;
  deviceType?: "mobile" | "desktop" | "tablet" | "unknown";
}): Promise<DeviceActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await (supabase.from("device_sessions") as any).insert({
    user_id: user.id,
    device_name: payload.deviceName,
    device_ip: payload.deviceIp ?? null,
    mac_address: payload.macAddress ?? null,
    os: payload.os ?? null,
    device_type: payload.deviceType ?? "unknown",
    connection_status: "connected",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/devices");
  return { success: true };
}

export async function disconnectDevice(deviceId: string): Promise<DeviceActionResult> {
  const supabase = await createClient();

  const { error } = await (supabase
    .from("device_sessions")as any)
    .update({
      connection_status: "disconnected",
      disconnected_at: new Date().toISOString(),
    })
    .eq("id", deviceId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/devices");
  return { success: true };
}

// ── Unauthorized Devices ─────────────────────────────────────

export async function getUnauthorizedDevices(): Promise<{
  data: UnauthorizedDeviceRow[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("unauthorized_devices")
    .select("*")
    .order("detected_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [] };
}

export async function reportUnauthorizedDevice(payload: {
  deviceName?: string;
  deviceIp?: string;
  macAddress?: string;
  deviceType?: "mobile" | "desktop" | "tablet" | "unknown";
  os?: string;
}): Promise<DeviceActionResult> {
  const supabase = await createClient();

  // Check if we've already seen this MAC address.
  // Cast the result variable (not the generic param) so the narrowed type
  // does NOT bleed into the subsequent .update() call on the same table.
  if (payload.macAddress) {
    const { data: existingRaw } = await supabase
      .from("unauthorized_devices")
      .select("id, attempts")
      .eq("mac_address", payload.macAddress)
      .maybeSingle();

    const existing = existingRaw as { id: string; attempts: number } | null;

    if (existing) {
      // Increment attempt counter
      const { error } = await (supabase
        .from("unauthorized_devices") as any)
        .update({
          attempts: existing.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) return { error: error.message };
      revalidatePath("/dashboard/devices");
      return { success: true };
    }
  }

  // New unauthorized device
  const { error } = await (supabase.from("unauthorized_devices") as any).insert({
    device_name: payload.deviceName ?? "Unknown Device",
    device_ip: payload.deviceIp ?? null,
    mac_address: payload.macAddress ?? null,
    device_type: payload.deviceType ?? "unknown",
    os: payload.os ?? null,
    attempts: 1,
    blocked: false,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/devices");
  return { success: true };
}

export async function blockUnauthorizedDevice(deviceId: string): Promise<DeviceActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await (supabase
    .from("unauthorized_devices") as any)
    .update({
      blocked: true,
      blocked_at: new Date().toISOString(),
      blocked_by: user.id,
    })
    .eq("id", deviceId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/devices");
  return { success: true };
}

export async function unblockUnauthorizedDevice(deviceId: string): Promise<DeviceActionResult> {
  const supabase = await createClient();

  const { error } = await (supabase
    .from("unauthorized_devices") as any)
    .update({ blocked: false, blocked_at: null, blocked_by: null })
    .eq("id", deviceId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/devices");
  return { success: true };
}

export async function deleteUnauthorizedDevice(deviceId: string): Promise<DeviceActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("unauthorized_devices")
    .delete()
    .eq("id", deviceId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/devices");
  return { success: true };
}
