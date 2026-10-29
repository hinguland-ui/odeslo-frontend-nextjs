"use client";

import { useState } from "react";
import { Button, Field, Input, KeyValue, Modal, Select } from "@/components/ui";
import type { Deal } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { fullDate, inr } from "@/lib/utils/format";

/** Choose number of units + time slot for a group deal. */
export function BookDealModal({
  deal,
  loading,
  onClose,
  onConfirm,
}: {
  deal: Deal | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (units: number, slot?: string) => void;
}) {
  const [units, setUnits] = useState("1");
  const [slot, setSlot] = useState("");
  if (!deal) return null;
  const n = Math.max(1, Number(units) || 1);
  const needsSlot = (deal.slots?.length ?? 0) > 0;
  return (
    <Modal
      open
      onClose={onClose}
      title="Book this deal"
      subtitle={deal.title}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button loading={loading} disabled={needsSlot && !slot} onClick={() => onConfirm(n, slot || undefined)}>
            {deal.available_units < n ? "Join waitlist" : `Book · ${inr(deal.price_per_unit * n)}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded-[16px] bg-panel p-3.5">
          <KeyValue label="Service" value={categoryOf(deal.category).label} />
          <KeyValue label="Service date" value={fullDate(deal.service_date)} />
          <KeyValue label="Price per unit" value={inr(deal.price_per_unit)} />
          <KeyValue label="Units left" value={`${deal.available_units} of ${deal.max_units}`} />
          <KeyValue label="Book before" value={fullDate(deal.cutoff_date)} />
        </div>
        <Field label="Units"><Input inputMode="numeric" value={units} onChange={(e) => setUnits(e.target.value.replace(/\D/g, ""))} /></Field>
        {needsSlot && (
          <Field label="Time slot">
            <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="">Choose a slot…</option>
              {deal.slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        )}
        {deal.cancel_policy && <p className="text-[11px] leading-[14px] text-muted">Cancellation: {deal.cancel_policy}</p>}
      </div>
    </Modal>
  );
}
