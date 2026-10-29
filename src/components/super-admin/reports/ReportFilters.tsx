"use client";

import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui";
import { SelectMenu } from "@/components/ui/SelectMenu";
import type { ReportFilters as Filters } from "@/lib/api/reports";
import { isoDate } from "@/lib/utils/format";

export type Preset = "today" | "7d" | "30d" | "month" | "last_month" | "quarter" | "year" | "custom";

const PRESETS: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom" },
];

export function presetRange(p: Exclude<Preset, "custom">): { from: string; to: string } {
  const n = new Date();
  const day = (d: Date) => isoDate(d);
  switch (p) {
    case "today": return { from: day(n), to: day(n) };
    case "7d": return { from: day(new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6)), to: day(n) };
    case "30d": return { from: day(new Date(n.getFullYear(), n.getMonth(), n.getDate() - 29)), to: day(n) };
    case "month": return { from: day(new Date(n.getFullYear(), n.getMonth(), 1)), to: day(n) };
    case "last_month": return { from: day(new Date(n.getFullYear(), n.getMonth() - 1, 1)), to: day(new Date(n.getFullYear(), n.getMonth(), 0)) };
    case "quarter": return { from: day(new Date(n.getFullYear(), Math.floor(n.getMonth() / 3) * 3, 1)), to: day(n) };
    case "year": return { from: day(new Date(n.getFullYear(), 0, 1)), to: day(n) };
  }
}

const SELECT = "h-8 min-w-[132px] cursor-pointer rounded-[19px] bg-mist px-3.5 text-[13px] font-semibold text-ink outline-none transition hover:bg-line focus:ring-2 focus:ring-ink/15";
const DATE_BOX = "h-[38px] cursor-pointer rounded-[19px] bg-mist px-3.5 text-[13px] font-semibold text-ink outline-none focus:ring-2 focus:ring-ink/15";

/** Societies as a checklist: none ticked = all societies. */
export function SocietyPicker({ societies, value, onChange, align = "left" }: { societies: { id: number; name: string }[]; value: number[]; onChange: (v: number[]) => void; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);
  const shown = societies.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  const label = value.length === 0 ? "All societies" : value.length === 1 ? societies.find((s) => s.id === value[0])?.name ?? "1 society" : `${value.length} societies`;
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={clsx(SELECT, "flex items-center justify-between gap-2", value.length > 0 && "!bg-ink !text-white hover:!bg-ink-soft")}>
        <span className="max-w-[160px] truncate">{label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className={clsx("absolute top-[44px] z-30 w-[280px] max-w-[calc(100vw-24px)] rounded-[18px] border border-line bg-white p-2.5 shadow-xl", align === "right" ? "right-0" : "left-0")}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search society" className="mb-2 h-9 w-full rounded-[12px] bg-mist px-3 text-[12px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-hint" />
          <div className="mb-1 flex items-center justify-between px-1 text-[11px] font-semibold">
            <button type="button" className="text-lilac-fg hover:underline" onClick={() => onChange(societies.map((s) => s.id))}>Select all</button>
            <button type="button" className="text-muted hover:underline" onClick={() => onChange([])}>Clear (all societies)</button>
          </div>
          <ul className="scroll-thin max-h-[240px] overflow-y-auto">
            {shown.map((s) => {
              const on = value.includes(s.id);
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => toggle(s.id)} className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left text-[13px] font-medium text-ink hover:bg-mist">
                    <span className={clsx("grid size-[18px] shrink-0 place-items-center rounded-[6px] border", on ? "border-ink bg-ink text-white" : "border-dash")}>{on && <Check size={12} strokeWidth={3} />}</span>
                    <span className="truncate">{s.name}</span>
                  </button>
                </li>
              );
            })}
            {!shown.length && <li className="px-2 py-3 text-[12px] text-muted">No society found</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Date range, societies, deal category, payment mode, grouping: everything the report (and its exports) can be filtered by. */
export function ReportFiltersBar({
  filters, preset, onPreset, onChange, societies, categories, onReset,
}: {
  filters: Filters;
  preset: Preset;
  onPreset: (p: Preset) => void;
  onChange: (patch: Partial<Filters>) => void;
  societies: { id: number; name: string }[];
  categories: { key: string; name: string }[];
  onReset: () => void;
}) {
  return (
    <div className="mb-4 rounded-[22px] border border-line bg-white p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => <Chip key={p.id} size="sm" active={preset === p.id} onClick={() => onPreset(p.id)}>{p.label}</Chip>)}
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" aria-label="From" value={filters.date_from} max={filters.date_to} onChange={(e) => e.target.value && onChange({ date_from: e.target.value })} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* arrows still work */ } }} className={DATE_BOX} />
            <span className="text-[12px] text-muted">to</span>
            <input type="date" aria-label="To" value={filters.date_to} min={filters.date_from} max={isoDate()} onChange={(e) => e.target.value && onChange({ date_to: e.target.value })} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* arrows still work */ } }} className={DATE_BOX} />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <SocietyPicker societies={societies} value={filters.society_ids} onChange={(v) => onChange({ society_ids: v })} />
        <SelectMenu size="sm" className="w-[170px]" value={filters.category} onChange={(v) => onChange({ category: v })} options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c.key, label: c.name }))]} />
        <SelectMenu size="sm" className="w-[170px]" value={filters.mode} onChange={(v) => onChange({ mode: v })} options={[{ value: "", label: "All payment modes" }, { value: "online", label: "Online" }, { value: "upi", label: "UPI" }, { value: "cash", label: "Cash" }, { value: "cheque", label: "Cheque" }, { value: "bank_transfer", label: "Bank transfer" }]} />
        <SelectMenu size="sm" className="w-[160px]" value={filters.group_by} onChange={(v) => onChange({ group_by: v as Filters["group_by"] })} options={[{ value: "", label: "Group: Auto" }, { value: "day", label: "Group: Daily" }, { value: "week", label: "Group: Weekly" }, { value: "month", label: "Group: Monthly" }]} />
        <button type="button" onClick={onReset} className="h-[38px] rounded-[19px] px-3.5 text-[12px] font-semibold text-muted hover:text-ink">Reset filters</button>
      </div>
    </div>
  );
}
