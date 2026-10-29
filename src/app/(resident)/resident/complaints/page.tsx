"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, CellTitle, DataTable, EmptyState, Field, FileInput, Modal, PageHeader, Panel, Select, StatusBadge, Textarea, type Column } from "@/components/ui";
import { ComplaintAside } from "@/components/resident/ComplaintAside";
import { useAction } from "@/hooks/useAction";
import { residentApi } from "@/lib/api/resident";
import type { Complaint } from "@/lib/types/ops";
import { COMPLAINT_CATEGORIES } from "@/lib/utils/categories";
import { ago, titleCase } from "@/lib/utils/format";

function RaiseModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<string>(COMPLAINT_CATEGORIES[0]);
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const raise = useAction(
    () => {
      const f = new FormData();
      f.set("category", category);
      f.set("priority", priority);
      f.set("description", description.trim());
      if (photo) f.set("photo", photo);
      return residentApi.raiseComplaint(f);
    },
    { invalidate: [["resident"]], success: "Complaint raised", onSuccess: onClose },
  );
  return (
    <Modal open onClose={onClose} title="Raise a complaint" footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={raise.isPending} disabled={description.trim().length < 5} onClick={() => raise.mutate(undefined)}>Submit</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category"><Select value={category} onChange={(e) => setCategory(e.target.value)}>{COMPLAINT_CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}</Select></Field>
          <Field label="Priority"><Select value={priority} onChange={(e) => setPriority(e.target.value)}>{["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}</Select></Field>
        </div>
        <Field label="What is the problem?"><Textarea autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue and where it is" /></Field>
        <Field label="Photo (optional)"><FileInput file={photo} onChange={setPhoto} accept="image/*" placeholder="Attach photo" /></Field>
      </div>
    </Modal>
  );
}

export default function ResidentComplaintsPage() {
  const [raising, setRaising] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const list = useQuery({ queryKey: ["resident", "complaints"], queryFn: residentApi.complaints, refetchInterval: 60_000 });

  const rows = list.data?.items ?? [];
  const selected = rows.find((c) => c.id === selectedId) ?? rows[0];

  const columns: Column<Complaint>[] = [
    { key: "c", header: "Complaint", width: "1.6fr", render: (c) => <CellTitle title={titleCase(c.category)} sub={`${c.complaint_no} · ${c.description}`} /> },
    { key: "p", header: "Priority", width: "0.7fr", render: (c) => titleCase(c.priority) },
    { key: "d", header: "Raised", width: "0.8fr", render: (c) => ago(c.created_at) },
    { key: "s", header: "Status", width: "0.9fr", render: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <>
      <PageHeader title="Complaints," light={`${rows.length} raised.`} actions={<Button plus onClick={() => setRaising(true)}>Raise complaint</Button>} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          loading={list.isLoading}
          rowHeight={55}
          onRowClick={(c) => setSelectedId(c.id)}
          selectedKey={selected?.id}
          className="min-h-[480px]"
          empty={<EmptyState title="No complaints" hint="Raise one if something needs fixing in your society." action={<Button size="sm" onClick={() => setRaising(true)}>Raise complaint</Button>} />}
        />
        {selected ? <ComplaintAside key={selected.id} complaintId={selected.id} /> : <Panel variant="soft"><EmptyState title="Select a complaint" /></Panel>}
      </div>
      {raising && <RaiseModal onClose={() => setRaising(false)} />}
    </>
  );
}
