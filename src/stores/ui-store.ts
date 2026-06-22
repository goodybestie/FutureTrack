"use client";
import { create } from "zustand";

/**
 * Tiny global UI store for state that needs to cross the boundary
 * between the dashboard segment layout (sidebar shell) and individual
 * page-level DashboardLayout wrappers (topbar). Avoids prop-drilling
 * `mobileOpen` through the route layout.
 */
interface UIStore {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}));
