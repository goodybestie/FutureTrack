"use client";
import { useEffect, useRef } from "react";
import { useWifiStore } from "@/stores/wifi-store";

/**
 * Boots the WiFi engine ONCE per app session — not per page.
 * Mounted at the dashboard route-group layout level so it survives
 * client-side navigation between dashboard pages instead of being
 * torn down and rebuilt on every sidebar click.
 */
export function WifiEngineProvider({ children }: { children: React.ReactNode }) {
  const init = useWifiStore(s => s.init);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    init();
    // Intentionally no destroy() on unmount — the engine should live
    // for the lifetime of the dashboard session, not per-page.
  }, [init]);

  return <>{children}</>;
}
