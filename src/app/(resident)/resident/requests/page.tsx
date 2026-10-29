"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, CellTitle, DataTable, EmptyState, Field, FileInput, Modal, Note, PageHeader, Select, StatusBadge, Textarea, type Column } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { openFile } from "@/lib/api/client";
import { residentApi } from "@/lib/api/resident";
import type { Req } from "@/lib/types/portal";
import { ago, titleCase } from "@/lib/utils/format";

function NewRequestModal({ onClose }: { onClose: () => void }) {
  const types = useQuery({ queryKey: ["resident", "request-types"], queryFn: residentApi.requestTypes, staleTime: Infinity });
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const raise = useAction(
    () => {
      const f = new FormData();
      f.set("type", type || types.data?.[0]?.value || "other");
      f.set("details", details.trim());
      if (file) f.set("attachment", file);
      return residentApi.raiseRequest(f);
    },
    { invalidate: [["resident"]], success: "Request sent to the society admin", onSuccess: onClose },
  );
  return (
    <Modal open onClose={onClose} title="New request" footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={raise.isPending} disabled={details.trim().length < 5} onClick={() => raise.mutate(undefined)}>Send request</Button></>}>
      <div className="space-y-4">
        <Field label="Request type">
          <Select value={type || types.data?.[0]?.value || ""} onChange={(e) => setType(e.target.value)}>
            {types.data?.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </Field>
        <Field label="Details"><Textarea autoFocus value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Dates, reason, anything the admin should know" /></Field>
        <Field label="Attachment (optional)"><FileInput file={file} onChange={setFile} accept="image/*,application/pdf" placeholder="Attach file" /></Field>
      </div>
    </Modal>
  );
}

export default function ResidentRequestsPage() {
  const [adding, setAdding] = useState(false);
  const list = useQuery({ queryKey: ["resident", "requests"], queryFn: residentApi.requests, refetchInterval: 60_000 });
  const withdraw = useAction((id: number) => residentApi.withdrawRequest(id), { invalidate: [["resident"]], success: "Request withdrawn" });

  const columns: Column<Req>[] = [
    { key: "t", header: "Request", width: "1.6fr", render: (r) => <CellTitle title={titleCase(r.type)} sub={`${r.request_no} · ${r.details}`} /> },
    { key: "n", header: "Admin note", width: "1.2fr", render: (r) => <span className="text-body">{r.admin_note ?? "—"}</span> },
    { key: "d", header: "Sent", width: "0.7fr", render: (r) => ago(r.created_at) },
    { key: "s", header: "Status", width: "0.8fr", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "a", header: "", width: "170px",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.attachment && <button className="text-[11px] font-semibold text-lilac-fg hover:underline" onClick={() => openFile(r.attachment!)}>File</button>}
          {r.status === "open" && <button className="text-[11px] font-semibold text-pink-fg hover:underline" onClick={() => withdraw.mutate(r.id)}>Withdraw</button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Requests," light="NOC, move-in/out, parking and more." actions={<Button plus onClick={() => setAdding(true)}>New request</Button>} />
      <DataTable columns={columns} rows={list.data?.items} rowKey={(r) => r.id} loading={list.isLoading} rowHeight={55} className="min-h-[420px]" empty={<EmptyState title="No requests yet" action={<Button size="sm" onClick={() => setAdding(true)}>New request</Button>} />} />
      <Note tone="lilac" className="mt-4">Your society admin reviews each request. You will get a notification when its status changes.</Note>
      {adding && <NewRequestModal onClose={() => setAdding(false)} />}
    </>
  );
}
