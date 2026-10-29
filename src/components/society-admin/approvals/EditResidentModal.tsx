"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Chip, Field, Input, Modal, Note, Select } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { residentsApi, type ResidentEdit } from "@/lib/api/residents";
import { societiesApi } from "@/lib/api/societies";
import type { Resident } from "@/lib/types/resident";
import { sentence } from "@/lib/utils/format";

type Kind = "owner" | "tenant" | "family";
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 10);

/**
 * Society admin fixes a join request (name, flat, owner/tenant/family, contact) and can approve it in the same step.
 * A flat that already has an approved owner / tenant cannot be chosen for another owner / tenant.
 */
export function EditResidentModal({ resident: r, onClose, onSaved }: { resident: Resident; onClose: () => void; onSaved?: () => void }) {
  const [name, setName] = useState(r.name);
  const [email, setEmail] = useState(r.email ?? "");
  const [kind, setKind] = useState<Kind>((["owner", "tenant", "family"].includes(r.resident_type) ? r.resident_type : "owner") as Kind);
  const [wingId, setWingId] = useState(String(r.wing_id));
  const [unitId, setUnitId] = useState(String(r.unit_id));
  const [ecName, setEcName] = useState(r.emergency_contact_name ?? "");
  const [ecMobile, setEcMobile] = useState(r.emergency_contact_mobile ?? "");

  const wings = useQuery({ queryKey: ["society", r.society_id, "wings"], queryFn: () => societiesApi.wings(r.society_id) });
  const units = useQuery({ queryKey: ["society", r.society_id, "units", wingId], queryFn: () => societiesApi.units(r.society_id, { wing_id: Number(wingId) }), enabled: !!wingId });

  const wing = wings.data?.find((w) => String(w.id) === wingId);
  // the resident's own current flat stays selectable; others must follow the owner/tenant rule
  const canPick = (u: { id: number; occupancy_status: string }) =>
    u.id === r.unit_id || (kind === "family" ? u.occupancy_status !== "vacant" : u.occupancy_status === "vacant");
  const options = units.data?.items.filter(canPick) ?? [];
  const hidden = (units.data?.items.length ?? 0) - options.length;
  const flatMoved = Number(wingId) !== r.wing_id || Number(unitId) !== r.unit_id || kind !== r.resident_type;

  const body = (): ResidentEdit => ({
    name: name.trim(),
    email: email.trim() || null,
    resident_type: kind,
    ...(flatMoved ? { wing_id: Number(wingId), unit_id: Number(unitId) } : {}),
    emergency_contact_name: ecName.trim() || null,
    emergency_contact_mobile: ecMobile || null,
  });

  const inv = [["residents"], ["dashboard"]];
  const save = useAction(() => residentsApi.update(r.id, body()), { invalidate: inv, success: "Details saved", onSuccess: () => { onSaved?.(); onClose(); } });
  const saveApprove = useAction(async () => { await residentsApi.update(r.id, body()); return residentsApi.approve(r.id); }, { invalidate: inv, success: `${r.name} approved`, onSuccess: () => { onSaved?.(); onClose(); } });
  const busy = save.isPending || saveApprove.isPending;
  const valid = name.trim().length >= 2 && !!wingId && !!unitId && (!ecMobile || ecMobile.length === 10);
  const reviewable = r.status === "pending_approval" || r.status === "rejected";

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${r.name}`}
      subtitle={`+91 ${r.mobile} · ${sentence(r.status.replace("_", " "))}`}
      width={540}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button variant="light" loading={save.isPending} disabled={!valid || busy} onClick={() => save.mutate(undefined)}>Save</Button>
          {reviewable && <Button loading={saveApprove.isPending} disabled={!valid || busy} onClick={() => saveApprove.mutate(undefined)}>Save &amp; approve</Button>}
        </>
      }
    >
      <div className="space-y-4">
        {r.rejection_reason && <Note tone="pink">Rejected earlier: {r.rejection_reason}</Note>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>

        {reviewable ? (
          <>
            <Field label="Resident type">
              <div className="flex gap-2">
                {(["owner", "tenant", "family"] as Kind[]).map((k) => (
                  <Chip key={k} size="sm" active={kind === k} onClick={() => { setKind(k); if (unitId !== String(r.unit_id)) setUnitId(""); }}>{sentence(k)}</Chip>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Wing / block">
                <Select value={wingId} onChange={(e) => { setWingId(e.target.value); setUnitId(""); }}>
                  {wings.data?.map((w) => <option key={w.id} value={w.id}>Wing {w.name}</option>)}
                </Select>
              </Field>
              <Field label="Flat">
                <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                  <option value="">Select…</option>
                  {options.map((u) => <option key={u.id} value={u.id}>{wing?.name}-{u.unit_no}{u.id === r.unit_id ? " (current)" : ""}</option>)}
                </Select>
              </Field>
            </div>
            {hidden > 0 && <p className="-mt-2 text-[11px] leading-[14px] text-muted">{hidden} flat{hidden === 1 ? " is" : "s are"} hidden because {kind === "family" ? "no household is registered there yet" : "an approved resident already lives there"}.</p>}
          </>
        ) : (
          <Note tone="gray">Flat and resident type are locked once a resident is approved. You can still correct their name, email and emergency contact.</Note>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Emergency contact"><Input value={ecName} onChange={(e) => setEcName(e.target.value)} /></Field>
          <Field label="Their mobile"><Input inputMode="numeric" value={ecMobile} onChange={(e) => setEcMobile(digits(e.target.value))} /></Field>
        </div>
      </div>
    </Modal>
  );
}
