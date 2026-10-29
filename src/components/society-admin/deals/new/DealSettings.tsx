"use client";

import { DatePicker, DateTimePicker, Eyebrow, Field, Input, Panel, Textarea, Toggle } from "@/components/ui";
import { categoryOf } from "@/lib/utils/categories";

export interface DealDraft {
  title: string;
  category: string;
  description: string;
  cutoff_date: string; // datetime-local
  service_date: string;
  slots: string;
  price_per_unit: number;
  max_units: number;
  pay_later_allowed: boolean;
  auto_promote_waitlist: boolean;
  cancel_policy: string;
}

function ToggleRow({ title, hint, checked, onChange }: { title: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] font-semibold leading-4 text-ink">{title}</p>
        {hint && <p className="text-[11px] leading-[13px] text-muted">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

/** Middle card: dates, price, capacity and rules for the new deal. */
export function DealSettings({ d, set }: { d: DealDraft; set: <K extends keyof DealDraft>(k: K, v: DealDraft[K]) => void }) {
  return (
    <Panel className="min-h-[644px]">
      <Eyebrow className="text-muted">Deal settings · {categoryOf(d.category).label}</Eyebrow>
      <div className="mt-3 space-y-3">
        <Field label="Deal title"><Input value={d.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Bookings close"><DateTimePicker value={d.cutoff_date} onChange={(v) => set("cutoff_date", v)} /></Field>
          <Field label="Service date"><DatePicker value={d.service_date} min={d.cutoff_date.slice(0, 10)} onChange={(v) => set("service_date", v)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[16px] bg-pink-bg px-3.5 py-3">
            <p className="text-[11px] font-semibold leading-[13px] text-pink-fg">Price per unit</p>
            <p className="flex items-center text-[20px] font-bold leading-[25px] text-ink">₹
              <input type="number" min={1} value={d.price_per_unit || ""} onChange={(e) => set("price_per_unit", Number(e.target.value))} className="w-full bg-transparent outline-none" placeholder="0" />
            </p>
            <p className="text-[11px] leading-[13px] text-body">What each resident pays</p>
          </div>
          <div className="rounded-[16px] bg-blue-bg px-3.5 py-3">
            <p className="text-[11px] font-semibold leading-[13px] text-blue-fg">Maximum units</p>
            <p className="flex items-center gap-1 text-[20px] font-bold leading-[25px] text-ink">
              <input type="number" min={1} value={d.max_units || ""} onChange={(e) => set("max_units", Number(e.target.value))} className="w-16 bg-transparent outline-none" />units
            </p>
            <p className="text-[11px] leading-[13px] text-body">After this, waitlist</p>
          </div>
        </div>
        <Field label="Time slots (comma separated)"><Input value={d.slots} onChange={(e) => set("slots", e.target.value)} placeholder="10:00 - 13:00, 14:00 - 17:00" /></Field>
        <Field label="Description"><Textarea rows={2} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="What's included" /></Field>
        <div className="space-y-2.5 rounded-[16px] bg-panel p-3.5">
          <ToggleRow title="Residents may pay after service" hint="Book now, pay before or after the visit" checked={d.pay_later_allowed} onChange={(v) => set("pay_later_allowed", v)} />
          <ToggleRow title="Auto-promote waitlist" hint="Next resident gets the spot when someone cancels" checked={d.auto_promote_waitlist} onChange={(v) => set("auto_promote_waitlist", v)} />
        </div>
      </div>
    </Panel>
  );
}
