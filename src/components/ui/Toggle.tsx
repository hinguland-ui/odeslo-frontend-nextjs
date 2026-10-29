"use client";

import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { Check, X } from "lucide-react";

/** 44×26 switch (Headless UI): the knob glides, shows a tick when on and a cross when off. */
export function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <Switch
      checked={checked}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        "group relative inline-flex h-[26px] w-11 shrink-0 items-center rounded-full outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ink/20 disabled:opacity-50",
        checked ? "bg-green-fg" : "bg-off",
      )}
    >
      <span className="pointer-events-none grid size-5 translate-x-[3px] place-items-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-data-[checked]:translate-x-[21px]">
        {checked ? <Check size={12} strokeWidth={3.2} className="text-green-fg" /> : <X size={12} strokeWidth={3.2} className="text-muted" />}
      </span>
    </Switch>
  );
}
