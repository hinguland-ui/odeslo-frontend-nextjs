"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, Button, Eyebrow, KeyValue, MiniStat, Panel, Skeleton } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { residentsApi } from "@/lib/api/residents";
import type { Resident } from "@/lib/types/resident";
import { fullDate, sentence, unitLabel } from "@/lib/utils/format";
import { MessageModal } from "./MessageModal";

const DOC_LABEL: Record<string, string> = {
  index_ii: "Index II", sale_deed: "Sale deed", rent_agreement: "Rent agreement",
  electricity_bill: "Electricity bill", id_proof: "ID proof", other: "Document",
};

/** Right panel with resident detail, family, vehicles and actions. */
export function ResidentAside({ resident, bookings, billStatus }: { resident: Resident; bookings: number; billStatus?: string }) {
  const [messaging, setMessaging] = useState(false);
  const detail = useQuery({ queryKey: ["residents", resident.id], queryFn: () => residentsApi.get(resident.id) });
  const inv = [["residents"], ["dashboard"]];
  const deactivate = useAction(() => residentsApi.deactivate(resident.id), { success: `${resident.name} deactivated`, invalidate: inv });
  const reactivate = useAction(() => residentsApi.reactivate(resident.id), { success: `${resident.name} reactivated`, invalidate: inv });

  const d = detail.data;
  const doc = d?.documents[0];
  const vehicle = d?.vehicles[0];

  return (
    <Panel variant="soft" as="aside" className="flex min-h-[652px] flex-col">
      <div className="flex items-center gap-3">
        <Avatar name={resident.name} size={52} />
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold leading-[22px] text-ink">{resident.name}</p>
          <p className="truncate text-[12px] leading-[15px] text-muted">
            {unitLabel(resident.wing_name, resident.unit_no)} · {sentence(resident.resident_type)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat label="Family" value={d?.family_members.length ?? "…"} className="!px-2.5" />
        <MiniStat label="Bookings" value={bookings} className="!px-2.5" />
        <MiniStat label="Vehicles" value={d?.vehicles.length ?? "…"} className="!px-2.5" />
      </div>

      {detail.isLoading ? (
        <Skeleton className="mt-3 h-[135px] !bg-white" />
      ) : (
        <div className="mt-3 space-y-2 rounded-[18px] bg-white p-3.5">
          <KeyValue label={<span className="text-muted">Mobile</span>} value={`+91 ${resident.mobile}`} valueClass="font-semibold" />
          <KeyValue label={<span className="text-muted">Approved</span>} value={fullDate(resident.approved_at)} valueClass="font-semibold" />
          <KeyValue
            label={<span className="text-muted">Maintenance</span>}
            value={billStatus ? sentence(billStatus) : "No bills yet"}
            valueClass={billStatus === "paid" ? "font-semibold text-green-fg" : billStatus === "overdue" ? "font-semibold text-pink-fg" : "font-semibold"}
          />
          <KeyValue label={<span className="text-muted">Proof</span>} value={doc ? `${DOC_LABEL[doc.doc_type] ?? sentence(doc.doc_type)} ${doc.status === "verified" ? "✓" : ""}` : "Not uploaded"} valueClass="font-semibold" />
          <KeyValue label={<span className="text-muted">Vehicle</span>} value={vehicle?.vehicle_number ?? "—"} valueClass="font-semibold" />
        </div>
      )}

      <Eyebrow className="mt-3 text-muted">Family</Eyebrow>
      <div className="mt-1.5 space-y-1.5 text-[13px] leading-4 text-ink">
        {d?.family_members.length
          ? d.family_members.map((f) => <p key={f.id}>{f.name} · {sentence(f.relation)}{f.mobile ? " · app user" : ""}</p>)
          : <p className="text-muted">No family members added.</p>}
      </div>

      <div className="mt-auto flex gap-2 pt-6">
        <Button className="flex-1" onClick={() => setMessaging(true)}>Message</Button>
        {resident.status === "deactivated" ? (
          <Button variant="success" className="flex-1" loading={reactivate.isPending} onClick={() => reactivate.mutate(undefined)}>Reactivate</Button>
        ) : (
          <Button variant="danger" className="flex-1" loading={deactivate.isPending} onClick={() => deactivate.mutate(undefined)}>Deactivate</Button>
        )}
      </div>
      <MessageModal open={messaging} onClose={() => setMessaging(false)} residentIds={[resident.id]} to={resident.name} />
    </Panel>
  );
}
