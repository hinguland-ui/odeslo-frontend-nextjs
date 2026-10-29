"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, DateTimePicker, EmptyState, Field, Input, KeyValue, Note, Panel, Select, StatusBadge } from "@/components/ui";
import { PageLoader } from "@/components/ui/Preloader";
import { JobChat } from "@/components/live/JobChat";
import { TrackVendor } from "@/components/live/TrackVendor";
import { useAction } from "@/hooks/useAction";
import { jobsApi, partnersApi } from "@/lib/api/deals";
import { staffApi } from "@/lib/api/ops";
import { dayMonth, inr, time } from "@/lib/utils/format";

const FINAL = ["completed", "cancelled"];

/** Assign a job to a verified vendor / staff member and record the vendor payout. */
export function JobAside({ jobId }: { jobId: number }) {
  const job = useQuery({ queryKey: ["jobs", jobId], queryFn: () => jobsApi.get(jobId) });
  const partners = useQuery({ queryKey: ["partners", "available"], queryFn: () => partnersApi.available() });
  const staff = useQuery({ queryKey: ["staff", "active"], queryFn: () => staffApi.list({ status: "active" }) });

  const [assignee, setAssignee] = useState("");
  const [when, setWhen] = useState("");
  const [slot, setSlot] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");

  const refresh = [["jobs"], ["dashboard"]];
  const assign = useAction(
    () => {
      const [type, id] = assignee.split(":");
      return jobsApi.assign(jobId, {
        assigned_to_type: type!,
        assigned_to_id: Number(id),
        scheduled_at: when || undefined,
        slot: slot.trim() || undefined,
      });
    },
    { invalidate: refresh, success: "Job assigned" },
  );
  const payout = useAction(() => jobsApi.payout(jobId, reference.trim(), amount ? Number(amount) : undefined), {
    invalidate: refresh,
    success: "Payout recorded",
  });

  const j = job.data;
  if (job.isLoading) return <Panel variant="soft"><PageLoader minHeight={400} /></Panel>;
  if (!j) return <Panel variant="soft"><EmptyState title="Could not load this job" /></Panel>;

  const done = FINAL.includes(j.status);
  const canPayout = j.status === "completed" && j.assigned_to_type === "partner" && j.payout_status !== "paid";

  return (
    <Panel variant="soft" as="aside" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted">{j.job_no}</p>
          <h2 className="mt-0.5 text-[16px] font-bold leading-[21px] text-ink">{j.title}</h2>
        </div>
        <StatusBadge status={j.status} />
      </div>

      <div className="space-y-2 rounded-[16px] bg-white p-3.5">
        <KeyValue label="Resident" value={j.resident_name ?? "—"} />
        <KeyValue label="Flat" value={j.unit_label ?? "—"} />
        <KeyValue label="Scheduled" value={j.scheduled_at ? `${dayMonth(j.scheduled_at)} · ${time(j.scheduled_at)}` : "Not set"} />
        <KeyValue label="Assigned to" value={j.assignee_name ? `${j.assignee_name} (${j.assigned_to_type})` : "Nobody yet"} />
        <KeyValue label="Vendor payout" value={`${inr(j.payout_amount)} · ${j.payout_status.replace("_", " ")}`} />
      </div>

      {j.issue_note && <Note tone="peach">Issue reported: {j.issue_note}</Note>}

      {["on_the_way", "started"].includes(j.status) && <TrackVendor jobId={j.id} jobStatus={j.status} />}
      <JobChat jobId={j.id} closed={j.status === "cancelled"} title="Chat (resident, vendor and you)" />

      {!done && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.88px] text-muted">{j.assigned_to_id ? "Reassign" : "Assign"}</p>
          <Field label="Vendor or staff">
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Choose…</option>
              <optgroup label="Verified vendors">
                {partners.data?.map((p) => (
                  <option key={p.id} value={`partner:${p.id}`}>{p.business_name ?? p.name}</option>
                ))}
              </optgroup>
              <optgroup label="Society staff">
                {staff.data?.items.map((s) => (
                  <option key={s.id} value={`staff:${s.id}`}>{s.name}</option>
                ))}
              </optgroup>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date & time"><DateTimePicker value={when} onChange={setWhen} /></Field>
            <Field label="Slot"><Input value={slot} onChange={(e) => setSlot(e.target.value)} placeholder="10am–12pm" /></Field>
          </div>
          <Button block disabled={!assignee} loading={assign.isPending} onClick={() => assign.mutate(undefined)}>
            {j.assigned_to_id ? "Reassign job" : "Assign job"}
          </Button>
        </div>
      )}

      {canPayout && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Record vendor payout</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reference / UTR"><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Txn id" /></Field>
            <Field label="Amount (₹)"><Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder={j.payout_amount != null ? String(j.payout_amount) : ""} /></Field>
          </div>
          <Button variant="success" block disabled={reference.trim().length < 3} loading={payout.isPending} onClick={() => payout.mutate(undefined)}>
            Mark payout paid
          </Button>
        </div>
      )}
    </Panel>
  );
}
