"use client";

import { Field, Input, Note, Select } from "@/components/ui";
import type { OnboardForm } from "./useOnboardForm";

export function BillingAdminStep({ form }: { form: OnboardForm }) {
  const { billing: b, setBilling, admin: a, setAdmin } = form;
  const num = (k: "flat" | "duplex" | "shop" | "due_day" | "late_fee") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBilling((x) => ({ ...x, [k]: Number(e.target.value) }));
  const adm = (k: keyof typeof a) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAdmin((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
        <Field label="Flat amount (₹)"><Input type="number" value={b.flat} onChange={num("flat")} /></Field>
        <Field label="Due day of month"><Input type="number" min={1} max={28} value={b.due_day} onChange={num("due_day")} /></Field>
        <Field label="Late fee (₹, 0 = none)">
          <Input type="number" value={b.late_fee} onChange={(e) => setBilling((x) => ({ ...x, late_fee: Number(e.target.value), late_fee_enabled: Number(e.target.value) > 0 }))} />
        </Field>
        <Field label="Cycle">
          <Select value={b.billing_cycle} onChange={(e) => setBilling((x) => ({ ...x, billing_cycle: e.target.value as "monthly" | "quarterly" }))}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </Select>
        </Field>
        <Field label="Duplex amount (₹)"><Input type="number" value={b.duplex} onChange={num("duplex")} /></Field>
        <Field label="Shop amount (₹)"><Input type="number" value={b.shop} onChange={num("shop")} /></Field>
      </div>

      <h3 className="mb-3 mt-4 text-[15px] font-bold leading-[19px] text-ink">Primary society admin</h3>
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
        <Field label="Full name"><Input value={a.name} onChange={adm("name")} /></Field>
        <Field label="Designation">
          <Select value={a.designation} onChange={adm("designation")}>
            {["secretary", "chairman", "treasurer", "manager", "other"].map((d) => (
              <option key={d} value={d}>{d[0]!.toUpperCase() + d.slice(1)}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mobile"><Input value={a.mobile} maxLength={10} inputMode="numeric" onChange={adm("mobile")} placeholder="10-digit mobile" /></Field>
        <Field label="Email"><Input type="email" value={a.email} onChange={adm("email")} /></Field>
      </div>
      <Note className="mt-3">The admin signs in with mobile OTP and sets a password on first login.</Note>
    </div>
  );
}
