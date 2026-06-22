import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Called from middleware.ts.
 * Refreshes the auth session token on every request so it never expires mid-session.
 * Also handles redirects: unauthenticated → /login, authenticated /login → /dashboard.
 *
 * NOTE: this runs on EVERY request, so it must never throw. If Supabase
 * env vars are missing (e.g. forgotten on a new Netlify deploy), we skip
 * auth checks entirely instead of crashing the whole site with a
 * non-null assertion failure.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = NextResponse.next({ request });

  // Graceful fallback: if env vars aren't configured yet, don't crash
  // the deploy — just let requests through unauthenticated-gated.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[middleware] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing — skipping auth check."
      );
    }
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not write any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your session
  // insecure — getUser() must be called to validate the session cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const isProtected = pathname.startsWith("/dashboard");

  // Only /login itself should bounce an already-authenticated user to
  // the dashboard. "/" intentionally redirects to the public landing
  // page (see src/app/page.tsx) and must stay reachable regardless of
  // auth state — it's the marketing page, not an auth gate.
  const isLoginPage = pathname === "/login";

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
