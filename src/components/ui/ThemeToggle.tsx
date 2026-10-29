"use client";

import clsx from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";
import { setThemePref, usePref, type ThemePref } from "@/lib/theme";

const NEXT: Record<ThemePref, ThemePref> = { light: "dark", dark: "system", system: "light" };
const LABEL: Record<ThemePref, string> = { light: "Light", dark: "Dark", system: "System" };

/** One tap cycles Light → Dark → System. `full` shows the word next to the icon (menus). */
export function ThemeToggle({ full, deep, className }: { full?: boolean; /** on a dark-in-both-modes surface (super admin menu) */ deep?: boolean; className?: string }) {
  const pref = usePref();
  const Icon = pref === "dark" ? Moon : pref === "light" ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={() => setThemePref(NEXT[pref])}
      title={`Theme: ${LABEL[pref]} (tap to change)`}
      aria-label={`Theme: ${LABEL[pref]}. Tap to change.`}
      suppressHydrationWarning
      className={clsx(
        "inline-flex h-[34px] items-center justify-center gap-2 rounded-full text-[12px] font-semibold transition",
        deep ? "bg-night text-night-muted hover:bg-night-line hover:text-white" : "bg-mist text-ink hover:bg-line",
        full ? "px-3.5" : "w-[34px]",
        className,
      )}
    >
      <Icon size={16} strokeWidth={2.2} suppressHydrationWarning />
      {full && <span suppressHydrationWarning>{LABEL[pref]}</span>}
    </button>
  );
}
