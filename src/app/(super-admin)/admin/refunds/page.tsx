"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState, MiniStat, PageHeader, Panel, Skeleton } from "@/components/ui";
import { ReasonModal } from "@/components/ui/ReasonModal";
import { RefundCard } from "@/components/super-admin/refunds/RefundCard";
import { useAction } from "@/hooks/useAction";
import { useLookups } from "@/hooks/useLookups";
import { refundsApi } from "@/lib/api/money";
import type { Refund } from "@/lib/types/money";

const INVALIDATE = [["refunds"], ["dashboard"]];

export default function RefundApprovalPage() {
  const look = useLookups();
  const [selected, setSelected] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<Refund | null>(null);
  const refunds = useQuery({ queryKey: ["refunds", "all"], queryFn: () => refundsApi.list() });

  const primary = useAction(
    (r: Refund) =>
      r.status === "requested" ? refundsApi.approve(r.id) : r.status === "approved" ? refundsApi.process(r.id, "gateway") : refundsApi.complete(r.id),
    { success: (r) => `${r.refund_no} is now ${r.status}`, invalidate: INVALIDATE },
  );
  const reject = useAction((a: { id: number; reason: string }) => refundsApi.reject(a.id, a.reason), {
    success: "Refund rejected",
    invalidate: INVALIDATE,
    onSuccess: () => setRejecting(null),
  });

  const all = refunds.data?.items ?? [];
  const queue = all
    .filter((r) => ["requested", "approved", "processed"].includes(r.status))
    .sort((a, b) => Number(b.amount > 1000) - Number(a.amount > 1000) || b.amount - a.amount);
  const count = (s: string) => all.filter((r) => r.status === s).length;
  const done = all.filter((r) => r.completed_at);
  const avgDays = done.length
    ? done.reduce((s, r) => s + (new Date(r.completed_at!).getTime() - new Date(r.created_at).getTime()) / 86_400_000, 0) / done.length
    : null;
  const month = new Date().toLocaleDateString("en-IN", { month: "long" });

  return (
    <>
      <PageHeader
        title="Refund approval,"
        light={`${queue.length} waiting on you.`}
        subtitle="Society admins approve refunds up to ₹1,000. Larger or disputed refunds come here."
      />

      {refunds.isLoading ? (
        <div className="grid grid-cols-3 gap-3.5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[343px] rounded-[24px]" />)}</div>
      ) : !queue.length ? (
        <Panel><EmptyState title="No refunds waiting" hint="New refund requests from residents and society admins will appear here." /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {queue.map((r) => (
            <RefundCard
              key={r.id}
              refund={r}
              society={look.society(r.society_id)}
              resident={look.residentName(r.resident_id)}
              unit={look.residentUnit(r.resident_id)}
              selected={selected === r.id}
              busy={primary.isPending && primary.variables?.id === r.id}
              onSelect={() => setSelected(r.id)}
              onPrimary={() => primary.mutate(r)}
              onReject={() => setRejecting(r)}
            />
          ))}
        </div>
      )}

      <Panel variant="soft" className="mt-4">
        <h2 className="text-[15px] font-bold leading-[19px] text-ink">Refund pipeline · {month}</h2>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-5">
          <MiniStat label="Requested" value={count("requested")} valueClass="!text-[20px] !leading-[25px]" className="!rounded-[16px] !p-3" />
          <MiniStat label="Approved" value={count("approved")} valueClass="!text-[20px] !leading-[25px]" className="!rounded-[16px] !p-3" />
          <MiniStat label="Processing" value={count("processed")} valueClass="!text-[20px] !leading-[25px]" className="!rounded-[16px] !p-3" />
          <MiniStat label="Completed" value={count("completed")} valueClass="!text-[20px] !leading-[25px]" className="!rounded-[16px] !p-3" />
          <MiniStat label="Avg time to refund" value={avgDays == null ? "—" : `${avgDays.toFixed(1)} days`} valueClass="!text-[20px] !leading-[25px]" className="!rounded-[16px] !p-3" />
        </div>
      </Panel>

      <ReasonModal
        key={rejecting?.id ?? "none"}
        open={!!rejecting}
        title={`Reject ${rejecting?.refund_no ?? "refund"}`}
        loading={reject.isPending}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => rejecting && reject.mutate({ id: rejecting.id, reason })}
      />
    </>
  );
}
