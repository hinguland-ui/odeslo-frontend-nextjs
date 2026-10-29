"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, ErrorState, PageHeader, ReasonModal, Skeleton } from "@/components/ui";
import { DealAside } from "@/components/society-admin/deals/detail/DealAside";
import { DealBookingsTable } from "@/components/society-admin/deals/detail/DealBookingsTable";
import { DealSummaryBar } from "@/components/society-admin/deals/detail/DealSummaryBar";
import { useAction } from "@/hooks/useAction";
import { dealsApi } from "@/lib/api/deals";
import { residentsApi } from "@/lib/api/residents";
import { dayMonth, time } from "@/lib/utils/format";
import { statusLabel } from "@/lib/utils/status";

export default function DealDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [cancelling, setCancelling] = useState(false);
  const deal = useQuery({ queryKey: ["deal", id], queryFn: () => dealsApi.get(id) });
  const bookings = useQuery({ queryKey: ["deal", id, "bookings"], queryFn: () => dealsApi.bookings(id) });
  const residents = useQuery({ queryKey: ["residents", "active"], queryFn: () => residentsApi.list({ status: "active" }) });

  const inv = [["deal"], ["deals"], ["dashboard"]];
  const publish = useAction(() => dealsApi.publish(id), { success: "Deal is live", invalidate: inv });
  const close = useAction(() => dealsApi.close(id), { success: "Bookings closed — award a vendor next", invalidate: inv });
  const complete = useAction(() => dealsApi.complete(id), { success: "Deal marked completed", invalidate: inv });
  const cancel = useAction((reason: string) => dealsApi.cancel(id, reason), { success: "Deal cancelled, paid residents are refunded", invalidate: inv, onSuccess: () => setCancelling(false) });

  if (deal.error) return <ErrorState error={deal.error} onRetry={() => deal.refetch()} />;
  if (!deal.data) return <Skeleton className="h-[600px] rounded-[24px]" />;
  const d = deal.data;
  const all = bookings.data ?? [];
  const resMap = new Map(residents.data?.items.map((r) => [r.id, r]));
  const open = d.status === "published" || d.status === "full";

  return (
    <>
      <PageHeader
        breadcrumb={`Group deals / ${d.title} · ${statusLabel(d.status)} · bookings close ${dayMonth(d.cutoff_date)}, ${time(d.cutoff_date)}`}
        title={`${d.title},`}
        light={`${d.max_units - d.available_units} units booked.`}
        actions={
          <>
            {d.status === "draft" && <Button loading={publish.isPending} onClick={() => publish.mutate(undefined)}>Publish to residents</Button>}
            {open && <Button variant="light" loading={close.isPending} onClick={() => close.mutate(undefined)}>Close bookings</Button>}
            {["draft", "published", "full"].includes(d.status) && <Button variant="danger" onClick={() => setCancelling(true)}>Cancel deal</Button>}
            {d.status === "closed" && d.partner_id && <Button variant="light" loading={complete.isPending} onClick={() => complete.mutate(undefined)}>Mark completed</Button>}
            {(open || d.status === "closed") && <Button href={`/society/deals/${id}/award`}>{d.partner_id ? "Change vendor" : "Compare & award vendor"}</Button>}
          </>
        }
      />
      <DealSummaryBar deal={d} bookings={all} />
      <div className="mt-3.5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DealBookingsTable bookings={all} residents={resMap} loading={bookings.isLoading} />
        <DealAside deal={d} />
      </div>
      <ReasonModal open={cancelling} title={`Cancel ${d.title}`} confirmLabel="Cancel deal" loading={cancel.isPending}
        placeholder="Tell residents why (they are refunded automatically)" onClose={() => setCancelling(false)} onConfirm={(r) => cancel.mutate(r)} />
    </>
  );
}
