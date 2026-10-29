"use client";

import { Field, Input, Note, Panel, Toggle } from "@/components/ui";
import { inr } from "@/lib/utils/format";
import type { CatalogForm } from "./useCatalogForm";

function Money({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="rounded-[14px] bg-white px-3 py-2.5">
      <span className="block text-[11px] leading-[13px] text-muted">{label}</span>
      <span className="flex items-center text-[16px] font-bold leading-[21px] text-ink">
        ₹<input type="number" min={0} value={value || ""} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent outline-none" placeholder="0" />
      </span>
    </label>
  );
}

/** Right soft panel: price, vendor floor, commission and booking rules. */
export function PricingPanel({ form }: { form: CatalogForm }) {
  const { f, set, commission } = form;
  const pct = f.price_per_unit ? Math.round((commission / f.price_per_unit) * 100) : 0;
  const hasFloor = f.partner_payout_per_unit > 0;

  return (
    <Panel variant="soft" className="flex min-h-[709px] flex-col">
      <h2 className="text-[15px] font-bold leading-[19px] text-ink">Pricing &amp; rules</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Money label="Price per unit" value={f.price_per_unit} onChange={(v) => set("price_per_unit", v)} />
        <Money label="Vendor floor" value={f.partner_payout_per_unit} onChange={(v) => set("partner_payout_per_unit", v)} />
        <div className="rounded-[14px] bg-white px-3 py-2.5">
          <p className="text-[11px] leading-[13px] text-muted">Commission</p>
          <p className={`text-[16px] font-bold leading-[21px] ${commission < 0 ? "text-pink-fg" : "text-ink"}`}>{hasFloor ? `${pct}%` : "—"}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="grid h-[41px] grid-cols-[1fr_1fr_1fr_auto] items-center rounded-[16px] bg-white px-3.5 text-[12px]">
          <span className="text-[13px] font-bold text-ink">Per unit</span>
          <span className="text-body">1–{f.max_units} units</span>
          <span className="text-[16px] font-bold text-ink">{inr(f.price_per_unit)}</span>
          <span className="text-[11px] text-body">{hasFloor ? `You earn ${inr(commission)}` : "Set vendor floor"}</span>
        </div>
        <div className="grid h-[41px] grid-cols-[1fr_1fr_1fr_auto] items-center rounded-[16px] bg-lilac-bg px-3.5 text-[12px]">
          <span className="text-[13px] font-bold text-ink">Full deal</span>
          <span className="text-body">{f.max_units} units</span>
          <span className="text-[16px] font-bold text-ink">{inr(f.price_per_unit * f.max_units)}</span>
          <span className="text-[11px] text-body">{hasFloor ? `You earn ${inr(commission * f.max_units)}` : "GMV"}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between rounded-[16px] bg-pink-bg px-3.5 py-3">
          <div>
            <p className="text-[11px] font-semibold leading-[13px] text-pink-fg">Pay later allowed</p>
            <p className="text-[12px] text-ink">Book now, pay before service</p>
          </div>
          <Toggle checked={f.pay_later_allowed} onChange={(v) => set("pay_later_allowed", v)} label="Pay later" />
        </div>
        <div className="flex items-center justify-between rounded-[16px] bg-blue-bg px-3.5 py-3">
          <div>
            <p className="text-[11px] font-semibold leading-[13px] text-blue-fg">Auto-promote waitlist</p>
            <p className="text-[12px] text-ink">When a booking cancels</p>
          </div>
          <Toggle checked={f.auto_promote_waitlist} onChange={(v) => set("auto_promote_waitlist", v)} label="Auto-promote" />
        </div>
      </div>

      <Field label="Cancellation policy" className="mt-3">
        <Input value={f.cancel_policy} onChange={(e) => set("cancel_policy", e.target.value)} className="!bg-white" />
      </Field>

      <Note className="mt-auto !rounded-[16px] !px-3.5 !py-3">
        {commission < 0 ? "Price is below the vendor floor — raise the price or lower the payout." : "The vendor floor is what the vendor is paid per unit; the rest is platform commission."}
      </Note>
    </Panel>
  );
}
