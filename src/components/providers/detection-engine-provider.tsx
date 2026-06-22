"use client";
import { useEffect, useRef } from "react";
import { useDetectionStore } from "@/stores/detection-store";

/**
 * Boots the unauthorized-device detection engine once and keeps it
 * alive across re-renders of the Devices page. Guarded with a ref so
 * StrictMode double-invocation and fast re-mounts don't restart it.
 */
export function DetectionEngineProvider({ children }: { children: React.ReactNode }) {
  const init = useDetectionStore(s => s.init);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    init();
  }, [init]);

  return <>{children}</>;
}
