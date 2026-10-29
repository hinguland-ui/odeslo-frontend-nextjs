"use client";

import { useState } from "react";
import { Button, Field, KeyValue, Modal, StatusBadge, Textarea } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { societiesApi } from "@/lib/api/societies";
import type { Society } from "@/lib/types/society";
import { fullDate, titleCase } from "@/lib/utils/format";

/** Society quick view: details and activate / suspend. */
export function SocietyStatusModal({ society, onClose }: { society: Society | null; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const setStatus = useAction((status: string) => societiesApi.setStatus(society!.id, status, reason || undefined), {
    success: (s) => `${s.name} is now ${s.status}`,
    invalidate: [["societies"], ["society"], ["dashboard"]],
    onSuccess: onClose,
  });
  if (!society) return null;
  const s = society;
  const ms = s.maintenance_settings;

  return (
    <Modal open onClose={onClose} title={s.name} subtitle={`Code ${s.code} · ${s.area}, ${s.city}`} width={520}
      footer={
        <>
          <Button variant="light" href={`/admin/features?society=${s.id}`}>Feature controls</Button>
          {s.status !== "active" && <Button variant="success" loading={setStatus.isPending} onClick={() => setStatus.mutate("active")}>Activate</Button>}
          {s.status !== "suspended" && <Button variant="danger" loading={setStatus.isPending} onClick={() => setStatus.mutate("suspended")}>Suspend</Button>}
        </>
      }>
      <div className="space-y-2 rounded-[16px] bg-panel p-3.5">
        <KeyValue label="Status" value={<StatusBadge status={s.status} />} />
        <KeyValue label="Type" value={titleCase(s.type)} />
        <KeyValue label="Address" value={`${s.address}, ${s.pincode}`} />
        <KeyValue label="Maintenance" value={`₹${ms?.amounts?.flat ?? "—"} / flat · ${ms?.billing_cycle ?? "—"} · due ${ms?.due_day ?? "—"}`} />
        <KeyValue label="Onboarded" value={fullDate(s.created_at)} />
      </div>
      <Field label="Note for status change (optional)" className="mt-3">
        <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
    </Modal>
  );
}
