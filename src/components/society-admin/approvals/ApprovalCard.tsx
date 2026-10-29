"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import clsx from "clsx";
import { Avatar, Badge, Button, Note, ReasonModal } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { openFile } from "@/lib/api/client";
import { residentsApi } from "@/lib/api/residents";
import type { Resident } from "@/lib/types/resident";
import { ago, sentence, unitLabel } from "@/lib/utils/format";
import { EditResidentModal } from "./EditResidentModal";

const DOC: Record<string, string> = { index_ii: "Index II", sale_deed: "Sale deed", rent_agreement: "Rent agreement", electricity_bill: "Electricity bill", id_proof: "ID proof" };

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-panel px-3 py-2.5">
      <p className="text-[11px] leading-[13px] text-muted">{label}</p>
      <p className="truncate text-[14px] font-bold leading-[18px] text-ink">{value}</p>
    </div>
  );
}

/** One pending resident: unit/type/proof, conflict note and approve / reject. */
export function ApprovalCard({ resident: r, highlight }: { resident: Resident; highlight?: boolean }) {
  const toast = useToast();
  const [rejecting, setRejecting] = useState(false);
  const [editing, setEditing] = useState(false);
  const detail = useQuery({ queryKey: ["residents", r.id], queryFn: () => residentsApi.get(r.id) });
  const inv = [["residents"], ["dashboard"]];
  const approve = useAction(() => residentsApi.approve(r.id), { success: `${r.name} approved`, invalidate: inv });
  const reject = useAction((reason: string) => residentsApi.reject(r.id, reason), { success: `${r.name} rejected`, invalidate: inv, onSuccess: () => setRejecting(false) });

  const unit = unitLabel(r.wing_name, r.unit_no);
  const doc = detail.data?.documents[0];
  const occupant = detail.data?.occupied_by;
  const pending = r.status === "pending_approval";
  const conflict = r.unit_occupied_flag && !!occupant;

  return (
    <article className={clsx("flex flex-col rounded-[24px] border bg-white p-[18px]", conflict ? "border-pink-fg" : highlight ? "border-ink" : "border-line")}>
      <div className="flex items-center gap-3">
        <Avatar name={r.name} size={46} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold leading-[21px] text-ink">{r.name}</p>
          <p className="truncate text-[12px] leading-[15px] text-muted">+91 {r.mobile} · requested {ago(r.created_at)}</p>
        </div>
        {pending ? (
          <Badge dot={false} tone={r.unit_occupied_flag ? "pink" : "lilac"} className="!h-[23px] !px-3">{r.unit_occupied_flag ? "Unit occupied" : "New"}</Badge>
        ) : (
          <Badge tone={r.status === "active" ? "green" : "pink"}>{r.status === "active" ? "Approved" : "Rejected"}</Badge>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini label="Unit" value={unit} />
        <Mini label="Type" value={sentence(r.resident_type)} />
        <Mini label="Proof" value={detail.isLoading ? "…" : doc ? DOC[doc.doc_type] ?? sentence(doc.doc_type) : "Not uploaded"} />
      </div>

      <Note tone={conflict ? "pink" : pending ? "green" : "gray"} className="mt-3">
        {r.rejection_reason
          ? `Rejected: ${r.rejection_reason}`
          : conflict
            ? `${unit} already has an approved ${occupant!.resident_type} (${occupant!.name}). Edit this request and move ${r.name} to another flat, or reject it.`
            : `No other active ${r.resident_type} is registered on ${unit}.`}
      </Note>

      {pending && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="flex-1" loading={approve.isPending} disabled={conflict} onClick={() => approve.mutate(undefined)}>Approve</Button>
          <Button variant="light" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="light" disabled={!doc} onClick={() => doc && openFile(doc.file_path).catch((e) => toast(e.message, "error"))}>View proof</Button>
          <Button variant="danger" onClick={() => setRejecting(true)}>Reject</Button>
        </div>
      )}
      {r.status === "rejected" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="flex-1" onClick={() => setEditing(true)}>Edit &amp; approve</Button>
          <Button variant="light" loading={approve.isPending} disabled={conflict} onClick={() => approve.mutate(undefined)}>Approve as is</Button>
          <Button variant="light" disabled={!doc} onClick={() => doc && openFile(doc.file_path).catch((e) => toast(e.message, "error"))}>View proof</Button>
        </div>
      )}
      {r.status === "active" && (
        <div className="mt-3 flex gap-2"><Button variant="light" onClick={() => setEditing(true)}>Edit details</Button></div>
      )}
      {editing && <EditResidentModal resident={r} onClose={() => setEditing(false)} />}
      <ReasonModal open={rejecting} title={`Reject ${r.name}`} loading={reject.isPending} onClose={() => setRejecting(false)} onConfirm={(x) => reject.mutate(x)} />
    </article>
  );
}
