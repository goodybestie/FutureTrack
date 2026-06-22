"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { UserRow, UserRole, UserStatus } from "@/types/database";

export interface UserActionResult {
  error?: string;
  success?: boolean;
  data?: UserRow;
}

export async function getUsers(options?: {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
}): Promise<{ data: UserRow[]; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("users")
    .select("*")
    .order("full_name", { ascending: true });

  if (options?.role) query = query.eq("role", options.role);
  if (options?.status) query = query.eq("status", options.status);
  if (options?.department) query = query.eq("department", options.department);
  if (options?.search) {
    query = query.or(
      `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,employee_id.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [] };
}

export async function getUserById(id: string): Promise<{ data: UserRow | null; error?: string }> {
  const supabase = await createClient();
  const { data: dataRaw, error } = await supabase.from("users").select("*").eq("id", id).single();
  const data = dataRaw as UserRow | null;
  if (error) return { data: null, error: error.message };
  return { data };
}

/** Admin only: update any user's role/status */
export async function updateUserRole(userId: string, role: UserRole): Promise<UserActionResult> {
  const supabase = await createClient();

  const { error } = await (supabase
    .from("users") as any)
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<UserActionResult> {
  const supabase = await createClient();

  const { error } = await (supabase
    .from("users") as any)
    .update({ status })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/users");
  return { success: true };
}

/** Admin only: create a new user via service role (bypasses email confirm in dev) */
export async function adminCreateUser(payload: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
}): Promise<UserActionResult> {
  // Use service role to create the auth user
  const serviceClient = createServiceClient();

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    user_metadata: {
      full_name: payload.fullName,
      role: payload.role,
    },
    email_confirm: true, // auto-confirm in admin flow
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Failed to create auth user." };

  // The trigger will create the public.users row, but we update extra fields
  const { data: profileRaw, error: profileError } = await (serviceClient
    .from("users") as any)
    .update({
      department: payload.department ?? null,
      employee_id: payload.employeeId ?? null,
      role: payload.role,
    })
    .eq("id", authData.user.id)
    .select()
    .single();

  if (profileError) return { error: profileError.message };
  const profile = profileRaw as UserRow | null;
  revalidatePath("/dashboard/users");
  return { success: true, data: profile ?? undefined };
}

/** Admin only: delete a user entirely */
export async function adminDeleteUser(userId: string): Promise<UserActionResult> {
  const serviceClient = createServiceClient();

  // Deleting from auth.users cascades to public.users via FK
  const { error } = await serviceClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/users");
  return { success: true };
}
