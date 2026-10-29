"use client";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import clsx from "clsx";
import { Check, ChevronDown, Plus } from "lucide-react";
import type { ReactNode } from "react";

export interface MenuOption { value: string; label: string; hint?: string }

/**
 * Dropdown with search-free keyboard support (Headless UI Listbox) and an optional "create new" row at the bottom.
 * Use it where a plain <select> cannot offer "can't find it? add it here".
 */
export function SelectMenu({ value, options, onChange, placeholder = "Select", emptyText = "Nothing here yet", createLabel, onCreate, disabled, className, size = "md", align = "start", width }: {
  value: string;
  options: MenuOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  emptyText?: ReactNode;
  createLabel?: string;
  onCreate?: () => void;
  disabled?: boolean;
  className?: string;
  /** "sm" = 32px pill for toolbars and chart headers. */
  size?: "md" | "sm";
  /** Which edge the list lines up with (use "end" for controls at the right edge of the screen). */
  align?: "start" | "end";
  /** Minimum width of the list in px (a narrow pill can still show long names). */
  width?: number;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={clsx("relative", className)}>
        <ListboxButton className={clsx("group flex w-full items-center justify-between gap-2 bg-mist text-left font-semibold text-ink outline-none transition hover:bg-line focus-visible:ring-2 focus-visible:ring-ink/10 data-[open]:ring-2 data-[open]:ring-ink/10 disabled:opacity-60", size === "sm" ? "h-8 rounded-[16px] px-3 text-[12px]" : "h-11 rounded-[14px] px-[14px] text-[13px] leading-[16.5px]")}>
          <span className={clsx("truncate", !current && "font-medium text-hint")}>{current?.label ?? placeholder}</span>
          <ChevronDown size={16} className="shrink-0 text-muted transition-transform group-data-[open]:rotate-180" aria-hidden />
        </ListboxButton>
        <ListboxOptions
          anchor={{ to: align === "end" ? "bottom end" : "bottom start", gap: 6, padding: 12 }}
          transition
          style={width ? { minWidth: width } : undefined}
          className="z-[60] max-h-72 w-[var(--button-width)] overflow-y-auto rounded-[16px] border border-line bg-white p-1.5 shadow-[0_18px_50px_rgba(28,28,34,0.16)] outline-none transition duration-150 ease-out [--anchor-max-height:18rem] data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {options.length === 0 && <p className="px-3 py-2.5 text-[12px] text-muted">{emptyText}</p>}
          {options.map((o) => (
            <ListboxOption key={o.value || "__none"} value={o.value}
              className="group flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-[13px] font-semibold text-ink data-[focus]:bg-mist data-[selected]:bg-lilac-bg">
              <span className="min-w-0 flex-1 truncate">{o.label}{o.hint && <span className="ml-2 text-[11px] font-medium text-muted">{o.hint}</span>}</span>
              <Check size={15} className="invisible text-lilac-fg group-data-[selected]:visible" aria-hidden />
            </ListboxOption>
          ))}
          {onCreate && (
            <>
              {options.length > 0 && <div className="my-1 h-px bg-line" />}
              <button type="button" onClick={onCreate}
                className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-violet transition hover:bg-lilac-bg">
                <span className="grid size-5 place-items-center rounded-full bg-violet text-white"><Plus size={13} strokeWidth={3} /></span>
                {createLabel ?? "Create new"}
              </button>
            </>
          )}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
