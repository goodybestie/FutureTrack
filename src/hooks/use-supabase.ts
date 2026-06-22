"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Returns a stable Supabase browser client for use in Client Components.
 * The client is memoized — one instance per component mount.
 */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
