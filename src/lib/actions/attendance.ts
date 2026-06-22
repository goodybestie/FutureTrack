"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus, AttendanceLogWithUser, TodayAttendanceSummary } from "@/types/database";

export interface AttendanceActionResult {
  error?: string;
  data?: unknown;
  success?: boolean;
}

/** Fetch attendance logs with user info, optionally filtered */
export async function getAttendanceLogs(options?: {
  date?: string;
  userId?: string;
  status?: AttendanceStatus;
  limit?: number;
  offset?: number;
}): Promise<{ data: AttendanceLogWithUser[]; count: number; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("attendance_logs")
    .select(
      `*,
      users (
        id, full_name, email, department, avatar_url
      )`,
      { count: "exact" }
    )
    .order("date", { ascending: false })
    .order("check_in", { ascending: false });

  if (options?.date)   query = query.eq("date", options.date);
  if (options?.userId) query = query.eq("user_id", options.userId);
  if (options?.status) query = query.eq("status", options.status);
  if (options?.limit)  query = query.limit(options.limit);
  if (options?.offset) query = query.range(
    options.offset,
    (options.offset ?? 0) + (options.limit ?? 20) - 1
  );

  const { data, count, error } = await query;
  if (error) return { data: [], count: 0, error: error.message };
  return { data: (data as AttendanceLogWithUser[]) ?? [], count: count ?? 0 };
}

/** Check in the current user */
export async function checkIn(location?: string): Promise<AttendanceActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const today = new Date().toISOString().split("T")[0];

  // Use a separate client query for the existence check so its narrowed
  // return type does NOT bleed into the subsequent .update() call on the
  // same table. Casting the result (not the generic param) avoids the
  // "Argument of type ... not assignable to 'never'" error.
  const { data: existingRaw } = await supabase
    .from("attendance_logs")
    .select("id, check_in")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  const existing = existingRaw as { id: string; check_in: string | null } | null;

  if (existing?.check_in) {
    return { error: "You have already checked in today." };
  }

  const checkInTime = new Date().toISOString();
  const workStartHour = 9;
  const hour   = new Date().getHours();
  const minute = new Date().getMinutes();
  const lateThresholdMinutes = 15;
  const isLate =
    hour > workStartHour ||
    (hour === workStartHour && minute > lateThresholdMinutes);
  const status: AttendanceStatus = isLate ? "late" : "present";

  if (existing) {
    // Update the existing absent/placeholder record
    const { error } = await (supabase
      .from("attendance_logs") as any)
      .update({ check_in: checkInTime, status, location: location ?? null })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await (supabase
      .from("attendance_logs") as any)
      .insert({
        user_id:  user.id,
        date:     today,
        check_in: checkInTime,
        status,
        location: location ?? "HQ",
      });
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
  return { success: true };
}

/** Check out the current user */
export async function checkOut(): Promise<AttendanceActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const today = new Date().toISOString().split("T")[0];

  const { data: logRaw } = await supabase
    .from("attendance_logs")
    .select("id, check_in, check_out")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  const log = logRaw as {
    id: string;
    check_in:  string | null;
    check_out: string | null;
  } | null;

  if (!log?.check_in)  return { error: "You haven't checked in today." };
  if (log.check_out)   return { error: "You have already checked out today." };

  const { error } = await (supabase
    .from("attendance_logs") as any)
    .update({ check_out: new Date().toISOString() })
    .eq("id", log.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
  return { success: true };
}

/** Admin: manually set a user's attendance record */
export async function upsertAttendance(payload: {
  userId:    string;
  date:      string;
  status:    AttendanceStatus;
  checkIn?:  string;
  checkOut?: string;
  location?: string;
  notes?:    string;
}): Promise<AttendanceActionResult> {
  const supabase = await createClient();

  const { error } = await (supabase
    .from("attendance_logs") as any)
    .upsert(
      {
        user_id:   payload.userId,
        date:      payload.date,
        status:    payload.status,
        check_in:  payload.checkIn  ?? null,
        check_out: payload.checkOut ?? null,
        location:  payload.location ?? null,
        notes:     payload.notes    ?? null,
      },
      { onConflict: "user_id,date" }
    );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/attendance");
  return { success: true };
}

/** Fetch today's summary stats */
export async function getTodayStats(): Promise<TodayAttendanceSummary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("today_attendance_summary")
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  return data as TodayAttendanceSummary;
}
