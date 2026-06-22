import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Browser-side Supabase client.
 * Use in Client Components ("use client") only.
 * Singleton pattern — one instance per browser tab.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Set these in your Netlify site's Environment Variables (Site settings → " +
      "Environment variables) and trigger a redeploy. Note: NEXT_PUBLIC_ vars " +
      "are baked in at build time, so changing them requires a fresh build, " +
      "not just a server restart."
    );
  }

  return createBrowserClient<Database>(url, key);
}
