"use client";

import { useSyncExternalStore } from "react";

export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "odeslo-theme";

/** Runs before first paint (inline in <head>) so the page never flashes the wrong theme. */
export const THEME_BOOT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getPref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

const isDark = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  emit();
}

export function setThemePref(pref: ThemePref) {
  try { localStorage.setItem(THEME_KEY, pref); } catch { /* private mode: still switch for this visit */ }
  apply(pref);
}

if (typeof window !== "undefined") {
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => getPref() === "system" && apply("system"));
  window.addEventListener("storage", (e) => e.key === THEME_KEY && apply(getPref()));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** "light" | "dark" actually in effect (server render: light). */
export function useTheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, () => (isDark() ? "dark" : "light"), () => "light");
}
export function usePref(): ThemePref {
  return useSyncExternalStore(subscribe, getPref, () => "system" as ThemePref);
}
