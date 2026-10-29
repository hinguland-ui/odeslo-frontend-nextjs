"use client";

import { useState } from "react";
import { Badge, Button, KeyValue, Panel, ReasonModal } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { refundsApi } from "@/lib/api/money";
import type { Refund } from "@/lib/types/money";
import { inr } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";
import { RefundTimeline } from "./RefundTimeline";

export function RefundAside({ refund: r, who, what }: { refund: Refund; who: string; what: string }) {
  const [rejecting, setRejecting] = useState(false);
  const inv = [["refunds"], ["dashboard"]];
  const approve = useAction(() => refundsApi.approve(r.id), { success: "Refund approved", invalidate: inv });
  const process = useAction((mode: "gateway" | "manual") => refundsApi.process(r.id, mode), { success: "Refund sent for processing", invalidate: inv });
  const complete = useAction(() => refundsApi.complete(r.id), { success: "Refund completed", invalidate: inv });
  const reject = useAction((reason: string) => refundsApi.reject(r.id, reason), { success: "Refund rejected", invalidate: inv, onSuccess: () => setRejecting(false) });

  return (
    <Panel variant="soft" as="aside" className="flex min-h-[611px] flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[12px] leading-[15px] text-muted">Refund {r.refund_no}</span>
        <Badge tone={statusTone(r.status)} dot={false}>{statusLabel(r.status)}</Badge>
      </div>
      <p className="mt-3 text-[26px] font-bold leading-[33px] tracking-[-0.78px] text-ink">{inr(r.amount)}</p>
      <p className="text-[13px] leading-4 text-body">{who} · {what}</p>
      <div className="mt-3"><RefundTimeline refund={r} /></div>
      <div className="mt-3 space-y-1.5">
        <KeyValue label={<span className="text-muted">Payment</span>} value={`#${r.payment_id}`} valueClass="font-semibold" />
        <KeyValue label={<span className="text-muted">Reason</span>} value={r.reason ?? "—"} valueClass="font-semibold" />
        <KeyValue label={<span className="text-muted">Policy</span>} value={r.amount > 1000 ? "Over ₹1,000 · super admin may review" : "Within your approval limit"} valueClass={r.amount > 1000 ? "font-semibold text-yellow-fg" : "font-semibold text-green-fg"} />
      </div>
      <div className="mt-auto flex gap-2 pt-6">
        {r.status === "requested" && (
          <>
            <Button className="flex-1" loading={approve.isPending} onClick={() => approve.mutate(undefined)}>Approve refund</Button>
            <Button variant="danger" onClick={() => setRejecting(true)}>Reject</Button>
          </>
        )}
        {r.status === "approved" && (
          <>
            <Button className="flex-1" loading={process.isPending && process.variables === "gateway"} onClick={() => process.mutate("gateway")}>Refund via gateway</Button>
            <Button variant="light" loading={process.isPending && process.variables === "manual"} onClick={() => process.mutate("manual")}>Manual</Button>
          </>
        )}
        {r.status === "processed" && <Button block loading={complete.isPending} onClick={() => complete.mutate(undefined)}>Mark completed</Button>}
      </div>
      <ReasonModal open={rejecting} title={`Reject ${r.refund_no}`} loading={reject.isPending} onClose={() => setRejecting(false)} onConfirm={(x) => reject.mutate(x)} />
    </Panel>
  );
}
