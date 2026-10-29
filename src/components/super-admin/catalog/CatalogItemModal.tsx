"use client";

import { useState } from "react";
import { Button, KeyValue, Modal, ReasonModal, StatusBadge } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { dealsApi } from "@/lib/api/deals";
import type { Deal } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { dayMonth, inr } from "@/lib/utils/format";

const INVALIDATE = [["catalog"], ["deals"], ["dashboard"]];

/** Quick actions on a catalog item: publish, close bookings, complete or cancel. */
export function CatalogItemModal({ deal, vendor, society, onClose }: { deal: Deal; vendor: string; society: string; onClose: () => void }) {
  const [cancelling, setCancelling] = useState(false);
  const opts = { invalidate: INVALIDATE, onSuccess: onClose };
  const publish = useAction(() => dealsApi.publish(deal.id), { ...opts, success: "Published — residents can book now" });
  const close = useAction(() => dealsApi.close(deal.id), { ...opts, success: "Bookings closed" });
  const complete = useAction(() => dealsApi.complete(deal.id), { ...opts, success: "Marked completed" });
  const cancel = useAction((reason: string) => dealsApi.cancel(deal.id, reason), { ...opts, success: "Deal cancelled, refunds raised" });

  return (
    <>
      <Modal open onClose={onClose} title={deal.title} subtitle={`${categoryOf(deal.category).label} · ${vendor}`} width={500}
        footer={
          <>
            {["draft", "published", "full"].includes(deal.status) && <Button variant="danger" onClick={() => setCancelling(true)}>Cancel deal</Button>}
            {deal.status === "draft" && <Button loading={publish.isPending} onClick={() => publish.mutate(undefined)}>Make active</Button>}
            {(deal.status === "published" || deal.status === "full") && <Button variant="light" loading={close.isPending} onClick={() => close.mutate(undefined)}>Close bookings</Button>}
            {deal.status === "closed" && <Button loading={complete.isPending} onClick={() => complete.mutate(undefined)}>Mark completed</Button>}
          </>
        }>
        <div className="space-y-2 rounded-[16px] bg-panel p-3.5">
          <KeyValue label="Status" value={<StatusBadge status={deal.status} />} />
          <KeyValue label="Where" value={deal.society_id ? society : "All societies"} />
          <KeyValue label="Price per unit" value={inr(deal.price_per_unit)} />
          <KeyValue label="Vendor payout per unit" value={deal.partner_payout_per_unit != null ? inr(deal.partner_payout_per_unit) : "—"} />
          <KeyValue label="Units booked" value={`${deal.max_units - deal.available_units} / ${deal.max_units}`} />
          <KeyValue label="Service date · cut-off" value={`${dayMonth(deal.service_date)} · ${dayMonth(deal.cutoff_date)}`} />
        </div>
        {deal.description && <p className="mt-3 text-[12px] leading-[17px] text-body">{deal.description}</p>}
      </Modal>
      <ReasonModal open={cancelling} title="Cancel this deal" confirmLabel="Cancel deal" loading={cancel.isPending}
        onClose={() => setCancelling(false)} onConfirm={(r) => cancel.mutate(r)} />
    </>
  );
}
