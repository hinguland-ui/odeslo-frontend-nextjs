"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, Field, KeyValue, Modal, Select, StatusBadge, Textarea } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { openFile } from "@/lib/api/client";
import { complaintsApi } from "@/lib/api/ops";
import type { Staff } from "@/lib/types/ops";
import { ago, fullDate, sentence } from "@/lib/utils/format";
import { PRIORITY_TONE } from "./ComplaintCard";

/** Complaint detail: assign staff, move status, comment thread. */
export function ComplaintModal({ id, staff, onClose }: { id: number; staff: Staff[]; onClose: () => void }) {
  const toast = useToast();
  const detail = useQuery({ queryKey: ["complaints", id], queryFn: () => complaintsApi.get(id) });
  const [staffId, setStaffId] = useState<number>(0);
  const [comment, setComment] = useState("");
  const inv = [["complaints"], ["dashboard"]];
  const assign = useAction(() => complaintsApi.assign(id, staffId), { success: "Assigned", invalidate: inv });
  const setStatus = useAction((s: "in_progress" | "resolved") => complaintsApi.setStatus(id, s), { success: (c) => `Marked ${sentence(c.status)}`, invalidate: inv });
  const addComment = useAction(() => complaintsApi.comment(id, comment), { success: "Comment added", invalidate: [["complaints", id]], onSuccess: () => setComment("") });

  const c = detail.data;
  const closed = c && (c.status === "resolved" || c.status === "closed");
  return (
    <Modal open onClose={onClose} width={560} title={c ? c.complaint_no : "Complaint"} subtitle={c ? `${sentence(c.category)} · ${c.unit_label ?? ""} · ${c.resident_name ?? ""}` : undefined}>
      {!c ? <p className="text-[13px] text-muted">Loading…</p> : (
        <div className="space-y-3">
          <p className="text-[14px] font-semibold leading-5 text-ink">{c.description}</p>
          <div className="space-y-1.5 rounded-[16px] bg-panel p-3.5">
            <KeyValue label="Status" value={<StatusBadge status={c.status} />} />
            <KeyValue label="Priority" value={<Badge dot={false} tone={PRIORITY_TONE[c.priority] ?? "gray"}>{sentence(c.priority)}</Badge>} />
            <KeyValue label="Raised" value={fullDate(c.created_at)} />
            <KeyValue label="Assigned to" value={c.assigned_staff_name ?? "Not assigned"} />
            {c.photo && <KeyValue label="Photo" value={<button className="text-lilac-fg underline" onClick={() => openFile(c.photo!).catch((e) => toast(e.message, "error"))}>View photo</button>} />}
          </div>
          {!closed && (
            <div className="flex items-end gap-2">
              <Field label="Assign staff" className="flex-1">
                <Select value={staffId} onChange={(e) => setStaffId(Number(e.target.value))}>
                  <option value={0}>Choose staff</option>
                  {staff.filter((s) => s.status === "active").map((s) => <option key={s.id} value={s.id}>{s.name} · {s.type}</option>)}
                </Select>
              </Field>
              <Button disabled={!staffId} loading={assign.isPending} onClick={() => assign.mutate(undefined)}>Assign</Button>
            </div>
          )}
          {!closed && (
            <div className="flex gap-2">
              {c.status !== "in_progress" && <Button variant="light" className="flex-1" loading={setStatus.isPending && setStatus.variables === "in_progress"} onClick={() => setStatus.mutate("in_progress")}>Mark in progress</Button>}
              <Button variant="success" className="flex-1" loading={setStatus.isPending && setStatus.variables === "resolved"} onClick={() => setStatus.mutate("resolved")}>Mark resolved</Button>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-muted">Updates</p>
            <div className="max-h-48 space-y-2 overflow-y-auto scroll-thin">
              {c.comments.length ? c.comments.map((m) => (
                <div key={m.id} className="rounded-[14px] bg-panel px-3 py-2">
                  <p className="text-[11px] font-semibold text-muted">{m.author_name} · {sentence(m.author_type)} · {ago(m.created_at)}{m.status_change ? ` · → ${sentence(m.status_change)}` : ""}</p>
                  <p className="text-[13px] text-ink">{m.comment}</p>
                </div>
              )) : <p className="text-[12px] text-muted">No updates yet.</p>}
            </div>
            <div className="mt-2 flex items-end gap-2">
              <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write an update for the resident" />
              <Button disabled={comment.trim().length < 2} loading={addComment.isPending} onClick={() => addComment.mutate(undefined)}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
