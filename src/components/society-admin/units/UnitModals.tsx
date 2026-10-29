"use client";

import { useState } from "react";
import { Button, Field, FileInput, Input, Modal, Note, Select } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { societiesApi } from "@/lib/api/societies";
import type { Wing } from "@/lib/types/society";

const INV = [["units"], ["society"], ["dashboard"]];

export function AddUnitModal({ open, onClose, societyId, wings, defaultWing }: { open: boolean; onClose: () => void; societyId: number; wings: Wing[]; defaultWing?: number }) {
  const [f, setF] = useState({ unit_no: "", wing_id: defaultWing ?? wings[0]?.id ?? 0, unit_type: "flat", floor: "" });
  const add = useAction(() => societiesApi.addUnit(societyId, { unit_no: f.unit_no.trim(), wing_id: Number(f.wing_id), unit_type: f.unit_type, floor: f.floor ? Number(f.floor) : null }), {
    success: (u) => `Unit ${u.unit_no} added`, invalidate: INV, onSuccess: onClose,
  });
  return (
    <Modal open={open} onClose={onClose} title="Add unit"
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button disabled={!f.unit_no || !f.wing_id} loading={add.isPending} onClick={() => add.mutate(undefined)}>Add unit</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Wing">
          <Select value={f.wing_id} onChange={(e) => setF({ ...f, wing_id: Number(e.target.value) })}>
            {wings.map((w) => <option key={w.id} value={w.id}>Wing {w.name}</option>)}
          </Select>
        </Field>
        <Field label="Unit number"><Input value={f.unit_no} onChange={(e) => setF({ ...f, unit_no: e.target.value })} placeholder="1004" /></Field>
        <Field label="Floor"><Input type="number" value={f.floor} onChange={(e) => setF({ ...f, floor: e.target.value })} /></Field>
        <Field label="Type">
          <Select value={f.unit_type} onChange={(e) => setF({ ...f, unit_type: e.target.value })}>
            <option value="flat">Flat</option><option value="duplex">Duplex</option><option value="shop">Shop</option><option value="row_house">Row house</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}

export function BulkUploadModal({ open, onClose, societyId }: { open: boolean; onClose: () => void; societyId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const upload = useAction(() => societiesApi.bulkUnits(societyId, file!), {
    success: (r) => `${r.created} units added, ${r.skipped} skipped`,
    invalidate: INV,
    onSuccess: (r) => (r.errors.length ? setErrors(r.errors) : onClose()),
  });
  const sample = "wing,unit_no,unit_type,floor\nA,101,flat,1\nA,102,flat,1";
  return (
    <Modal open={open} onClose={onClose} title="Bulk upload units" subtitle="CSV with columns wing, unit_no, unit_type, floor"
      footer={<>
        <Button variant="light" href={`data:text/csv;charset=utf-8,${encodeURIComponent(sample)}`}>Sample CSV</Button>
        <Button disabled={!file} loading={upload.isPending} onClick={() => upload.mutate(undefined)}>Upload</Button>
      </>}>
      <FileInput file={file} onChange={setFile} accept=".csv,text/csv" placeholder="Choose CSV file" />
      {errors.length > 0 && <Note tone="pink" className="mt-3 max-h-40 overflow-y-auto">{errors.map((e) => <p key={e}>{e}</p>)}</Note>}
    </Modal>
  );
}
