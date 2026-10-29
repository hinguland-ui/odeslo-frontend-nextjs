"use client";

import { useState } from "react";
import { Button, Eyebrow, Panel } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { jobsApi } from "@/lib/api/deals";
import { inr } from "@/lib/utils/format";
import type { SettlementRow } from "./buildSettlement";

function Line({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between text-[13px] leading-4">
      <span className="text-night-muted">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

/** Dark payout breakdown + approve, for the selected deal. */
export function PayoutCard({ row, society, vendor }: { row: SettlementRow; society: string; vendor: string }) {
  const [reference, setReference] = useState("");
  const pct = row.collected ? Math.round((row.commission / row.collected) * 100) : 0;
  const done = row.jobs.filter((j) => j.status === "completed").length;

  const approve = useAction(
    () => Promise.all(row.payableJobs.map((j) => jobsApi.payout(j.id, reference.trim(), j.payout_amount ?? undefined))),
    { success: (r) => `${r.length} job payout${r.length > 1 ? "s" : ""} marked paid`, invalidate: [["jobs"], ["partners"]], onSuccess: () => setReference("") },
  );

  return (
    <div className="space-y-3">
      <Panel variant="dark">
        <Eyebrow className="text-violet-soft">Payout · deal #{row.deal.id}</Eyebrow>
        <p className="mt-2.5 truncate text-[17px] font-bold leading-[22px]">{row.deal.title} · {society}</p>
        <div className="mt-2.5 space-y-2 rounded-[16px] bg-night p-3.5">
          <Line label={`Collected from ${row.units} units`} value={inr(row.collected)} />
          <Line label="− Cancellation refunds" value={inr(row.refunds)} color="text-rose-soft" />
          <Line label={`− Commission ${pct}%`} value={inr(row.commission)} color="text-violet-soft" />
          <div className="h-px bg-night-line" />
          <div className="flex items-end justify-between text-white">
            <span className="pb-1 text-[13px] font-semibold">Vendor payout</span>
            <span className="text-[22px] font-bold leading-7">{inr(row.payout)}</span>
          </div>
        </div>
        <p className="mt-2.5 text-[12px] leading-[15px] text-night-muted">
          To {vendor} · {done} of {row.jobs.length} jobs completed · {row.payableJobs.length} awaiting payout
        </p>
      </Panel>

      {row.status === "to_approve" && (
        <div className="space-y-2">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Bank / UPI transfer reference (UTR)"
            className="h-11 w-full rounded-[14px] bg-mist px-3.5 text-[13px] font-semibold outline-none placeholder:font-medium placeholder:text-hint"
          />
          <Button variant="violet" size="lg" block loading={approve.isPending} disabled={reference.trim().length < 4} onClick={() => approve.mutate(undefined)}>
            Approve payout
          </Button>
        </div>
      )}

      <Panel variant="soft" className="!rounded-[22px] !p-4">
        <p className="text-[13px] font-bold leading-4 text-ink">Payout rules</p>
        <p className="mt-1.5 text-[12px] leading-[15px] text-body">
          Payout unlocks only when every job in the deal is completed. Enter the bank transfer reference to mark each job&apos;s payout as paid.
        </p>
      </Panel>
    </div>
  );
}
