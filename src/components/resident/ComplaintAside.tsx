"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { Button, EmptyState, Field, Input, KeyValue, Panel, ReasonModal, StatusBadge } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { openFile } from "@/lib/api/client";
import { residentApi } from "@/lib/api/resident";
import { ago, titleCase } from "@/lib/utils/format";

/** A complaint thread: status, comments, add comment, close or reopen. */
export function ComplaintAside({ complaintId }: { complaintId: number }) {
  const [text, setText] = useState("");
  const [reopen, setReopen] = useState(false);
  const q = useQuery({ queryKey: ["resident", "complaint", complaintId], queryFn: () => residentApi.complaint(complaintId) });
  const refresh = [["resident"]];
  const comment = useAction((c: string) => residentApi.comment(complaintId, c), { invalidate: refresh, onSuccess: () => setText("") });
  const close = useAction(() => residentApi.closeComplaint(complaintId), { invalidate: refresh, success: "Complaint closed" });
  const reopenIt = useAction((r: string) => residentApi.reopenComplaint(complaintId, r), { invalidate: refresh, success: "Complaint reopened", onSuccess: () => setReopen(false) });

  const c = q.data;
  if (q.isLoading) return <Panel variant="soft"><PageLoader minHeight={420} /></Panel>;
  if (!c) return <Panel variant="soft"><EmptyState title="Could not load this complaint" /></Panel>;

  const closed = c.status === "closed";
  return (
    <Panel variant="soft" as="aside" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted">{c.complaint_no}</p>
          <h2 className="mt-0.5 text-[16px] font-bold leading-[21px] text-ink">{titleCase(c.category)}</h2>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <p className="rounded-[14px] bg-white px-3.5 py-3 text-[13px] leading-[18px] text-body">{c.description}</p>
      {c.photo && <button onClick={() => openFile(c.photo!)} className="self-start text-[12px] font-semibold text-lilac-fg hover:underline">View attached photo</button>}
      <div className="space-y-2 rounded-[16px] bg-white p-3.5">
        <KeyValue label="Priority" value={titleCase(c.priority)} />
        <KeyValue label="Assigned to" value={c.assigned_staff_name ?? "Not yet"} />
        <KeyValue label="Raised" value={ago(c.created_at)} />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Conversation</p>
        <ul className="space-y-2.5">
          {c.comments.length === 0 && <li className="text-[12px] text-muted">No replies yet.</li>}
          {c.comments.map((m) => (
            <li key={m.id} className="rounded-[14px] bg-white px-3 py-2.5 text-[12px] leading-4">
              <p className="font-semibold text-ink">{m.author_name} <span className="font-normal text-muted">· {titleCase(m.author_type)} · {ago(m.created_at)}</span></p>
              <p className="mt-0.5 text-body">{m.comment}</p>
              {m.status_change && <p className="mt-0.5 text-[11px] font-semibold text-lilac-fg">Status: {titleCase(m.status_change)}</p>}
            </li>
          ))}
        </ul>
      </div>

      {!closed && (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) comment.mutate(text.trim()); }}>
          <Field label="" className="flex-1"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a reply…" /></Field>
          <Button type="submit" className="mt-[2px]" loading={comment.isPending} disabled={!text.trim()}>Send</Button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {c.status === "resolved" && <Button variant="success" loading={close.isPending} onClick={() => close.mutate(undefined)}>Mark as closed</Button>}
        {(c.status === "resolved" || closed) && <Button variant="warn" onClick={() => setReopen(true)}>Reopen</Button>}
      </div>
      {reopen && <ReasonModal open title="Reopen this complaint" confirmLabel="Reopen" placeholder="What is still not fixed?" loading={reopenIt.isPending} onClose={() => setReopen(false)} onConfirm={(r) => reopenIt.mutate(r)} />}
    </Panel>
  );
}
