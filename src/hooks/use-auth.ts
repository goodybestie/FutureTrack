"use client";

import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { useSupabase } from "./use-supabase";
import type { UserRow } from "@/types/database";

interface AuthState {
  user: User | null;
  profile: UserRow | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Client-side auth state.
 * Provides both the raw Supabase User and the enriched UserRow profile.
 * Listens to auth state changes automatically (sign in / sign out / token refresh).
 */
export function useAuth(): AuthState {
  const supabase = useSupabase();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({ user: session.user, profile, session, loading: false });
      } else {
        setState({ user: null, profile: null, session: null, loading: false });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({ user: session.user, profile, session, loading: false });
        } else {
          setState({ user: null, profile: null, session: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function fetchProfile(userId: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return error ? null : (data as UserRow | null);
  }

  return state;
}
