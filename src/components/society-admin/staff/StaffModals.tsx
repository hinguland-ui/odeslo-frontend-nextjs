"use client";

import { useState } from "react";
import { Button, Field, FileInput, Input, Modal, Select } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { complaintsApi, staffApi } from "@/lib/api/ops";
import type { Complaint, Staff } from "@/lib/types/ops";
import { STAFF_TYPES } from "@/lib/utils/categories";
import { sentence } from "@/lib/utils/format";

export function AddStaffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [f, setF] = useState({ name: "", mobile: "", type: "guard", category: "" });
  const [idProof, setIdProof] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const create = useAction(() => {
    const fd = new FormData();
    fd.append("name", f.name.trim());
    fd.append("mobile", f.mobile);
    fd.append("type", f.type);
    if (f.category) fd.append("category", f.category);
    fd.append("id_proof", idProof!);
    fd.append("photo", photo!);
    return staffApi.create(fd);
  }, { success: "Staff added — they can log in with their mobile", invalidate: [["staff"]], onSuccess: onClose });
  const valid = f.name.trim().length >= 2 && /^\d{10}$/.test(f.mobile) && idProof && photo;
  return (
    <Modal open={open} onClose={onClose} title="Add staff" width={520}
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button disabled={!valid} loading={create.isPending} onClick={() => create.mutate(undefined)}>Add staff</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Mobile"><Input value={f.mobile} maxLength={10} inputMode="numeric" onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} /></Field>
        <Field label="Role">
          <Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {STAFF_TYPES.map((t) => <option key={t} value={t}>{sentence(t)}</option>)}
          </Select>
        </Field>
        <Field label="Area / shift (optional)"><Input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Main gate · night" /></Field>
        <Field label="ID proof"><FileInput file={idProof} onChange={setIdProof} accept="image/*,.pdf" /></Field>
        <Field label="Photo"><FileInput file={photo} onChange={setPhoto} accept="image/*" /></Field>
      </div>
    </Modal>
  );
}

/** Pick an unassigned complaint and give it to this staff member. */
export function AssignTaskModal({ staff, complaints, onClose }: { staff: Staff; complaints: Complaint[]; onClose: () => void }) {
  const pool = complaints.filter((c) => ["open", "reopened"].includes(c.status));
  const [id, setId] = useState<number>(pool[0]?.id ?? 0);
  const assign = useAction(() => complaintsApi.assign(id, staff.id), { success: `Assigned to ${staff.name}`, invalidate: [["complaints"], ["dashboard"]], onSuccess: onClose });
  return (
    <Modal open onClose={onClose} title={`Assign task to ${staff.name}`}
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button disabled={!id} loading={assign.isPending} onClick={() => assign.mutate(undefined)}>Assign</Button></>}>
      {pool.length ? (
        <Field label="Open complaint">
          <Select value={id} onChange={(e) => setId(Number(e.target.value))}>
            {pool.map((c) => <option key={c.id} value={c.id}>{c.complaint_no} · {sentence(c.category)} · {c.description.slice(0, 50)}</option>)}
          </Select>
        </Field>
      ) : <p className="text-[13px] text-muted">No unassigned complaints right now.</p>}
    </Modal>
  );
}
