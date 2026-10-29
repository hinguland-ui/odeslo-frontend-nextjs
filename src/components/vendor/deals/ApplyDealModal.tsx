"use client";

import { useState } from "react";
import { Button, Field, Input, KeyValue, Modal, Textarea } from "@/components/ui";
import type { Deal } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { fullDate, inr } from "@/lib/utils/format";

/** Vendor applies to serve a deal, optionally quoting the payout per unit they want. */
export function ApplyDealModal({
  deal,
  loading,
  onClose,
  onConfirm,
}: {
  deal: Deal | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (quote: number | undefined, message: string) => void;
}) {
  const [quote, setQuote] = useState("");
  const [message, setMessage] = useState("");
  if (!deal) return null;
  return (
    <Modal
      open
      onClose={onClose}
      title="Apply for this deal"
      subtitle={deal.title}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={() => onConfirm(quote ? Number(quote) : undefined, message.trim())}>Send application</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded-[16px] bg-panel p-3.5">
          <KeyValue label="Service" value={categoryOf(deal.category).label} />
          <KeyValue label="Service date" value={fullDate(deal.service_date)} />
          <KeyValue label="Resident price / unit" value={inr(deal.price_per_unit)} />
          <KeyValue label="Units booked so far" value={`${deal.confirmed_units} / ${deal.max_units}`} />
        </div>
        <Field label="Your payout per unit (₹)" hint="What you want to earn for each unit. Leave empty to let the society decide.">
          <Input inputMode="decimal" value={quote} onChange={(e) => setQuote(e.target.value.replace(/[^\d.]/g, ""))} placeholder={`e.g. ${Math.round(deal.price_per_unit * 0.8)}`} />
        </Field>
        <Field label="Message to the society (optional)">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Experience, availability, team size…" />
        </Field>
      </div>
    </Modal>
  );
}
