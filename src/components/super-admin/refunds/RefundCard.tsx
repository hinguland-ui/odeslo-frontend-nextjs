"use client";

import clsx from "clsx";
import { Badge, Button, KeyValue } from "@/components/ui";
import type { Refund } from "@/lib/types/money";
import { inr, relativeDay, sentence } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";

interface Props {
  refund: Refund;
  society: string;
  resident: string;
  unit: string;
  selected?: boolean;
  busy?: boolean;
  onPrimary: () => void;
  onReject: () => void;
  onSelect: () => void;
}

const PRIMARY: Record<string, string> = {
  requested: "Approve refund",
  approved: "Process via gateway",
  processed: "Mark completed",
};

/** One escalated refund (Figma "RF-2231 · Green Park" card). */
export function RefundCard({ refund: r, society, resident, unit, selected, busy, onPrimary, onReject, onSelect }: Props) {
  const big = r.amount > 1000;
  return (
    <article
      onClick={onSelect}
      className={clsx(
        "flex min-h-[343px] cursor-pointer flex-col rounded-[24px] border bg-white p-[18px] transition",
        selected ? "border-ink" : "border-line hover:border-dash",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] leading-[15px] text-muted">{r.refund_no} · {society}</span>
        {r.status === "requested" ? (
          <Badge tone={big ? "yellow" : "blue"} dot={false}>{big ? "Over ₹1,000" : "Under ₹1,000"}</Badge>
        ) : (
          <Badge tone={statusTone(r.status)} dot={false}>{statusLabel(r.status)}</Badge>
        )}
      </div>
      <p className="mt-3 text-[28px] font-bold leading-[35px] tracking-[-0.84px] text-ink">{inr(r.amount)}</p>
      <p className="mt-3 truncate text-[14px] font-bold leading-[18px] text-ink">{resident} · {unit}</p>
      <p className="text-[12px] leading-[15px] text-body">Requested {relativeDay(r.created_at)} by {sentence(r.requested_by_type ?? "resident")}</p>
      <div className="mt-3 rounded-[14px] bg-panel px-3 py-2.5 text-[12px] leading-[17.5px] text-body">
        {r.reason || "No reason given."}
      </div>
      <div className="mt-3 space-y-1.5">
        <KeyValue label={<span className="text-muted">Payment</span>} value={`#${r.payment_id}${r.booking_id ? ` · booking #${r.booking_id}` : ""}`} valueClass="font-semibold" />
        <KeyValue label={<span className="text-muted">Approved by</span>} value={r.approved_by_type ? sentence(r.approved_by_type) : "Waiting"} valueClass="font-semibold" />
      </div>
      <div className="mt-auto flex gap-2 pt-4" onClick={(e) => e.stopPropagation()}>
        {PRIMARY[r.status] && (
          <Button className="flex-1" loading={busy} onClick={onPrimary}>{PRIMARY[r.status]}</Button>
        )}
        {r.status === "requested" && <Button variant="danger" onClick={onReject}>Reject</Button>}
      </div>
    </article>
  );
}
