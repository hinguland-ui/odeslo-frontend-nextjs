"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLoader } from "@/components/ui/Preloader";
import { Badge, Button, EmptyState, KeyValue, Note, Panel, StatusBadge, Toggle } from "@/components/ui";
import { JobChat } from "@/components/live/JobChat";
import { useAction } from "@/hooks/useAction";
import { useShareLocation } from "@/hooks/useShareLocation";
import { openFile } from "@/lib/api/client";
import { vendorApi, type VendorJobStatus } from "@/lib/api/vendor";
import { dayMonth, inr, relativeDay, time } from "@/lib/utils/format";
import { statusLabel } from "@/lib/utils/status";
import { JobCompleteModal } from "./JobCompleteModal";
import { JobIssueModal } from "./JobIssueModal";

/** The one forward step the vendor can take from each status. */
const NEXT: Record<string, { to: VendorJobStatus; label: string } | undefined> = {
  assigned: { to: "accepted", label: "Accept job" },
  rescheduled: { to: "accepted", label: "Accept new time" },
  accepted: { to: "on_the_way", label: "I am on the way" },
  on_the_way: { to: "started", label: "Start work" },
  started: { to: "completed", label: "Mark complete" },
};
const FINAL = ["completed", "cancelled"];
const LIVE = ["on_the_way", "started"]; // location is shared only from "on the way"

export function JobDetail({ jobId }: { jobId: number }) {
  const [completing, setCompleting] = useState(false);
  const [issue, setIssue] = useState(false);
  const [shareOn, setShareOn] = useState(true);
  const job = useQuery({ queryKey: ["vendor", "job", jobId], queryFn: () => vendorApi.job(jobId) });

  const refresh = [["vendor"]];
  const step = useAction(
    (a: { to: VendorJobStatus; note?: string; photo?: File | null }) => vendorApi.setStatus(jobId, a.to, a.note, a.photo),
    { invalidate: refresh, success: (r) => `Job marked ${statusLabel(r.status).toLowerCase()}`, onSuccess: () => setCompleting(false) },
  );
  const report = useAction((a: { note: string; when?: string }) => vendorApi.reportIssue(jobId, a.note, a.when), {
    invalidate: refresh,
    success: "Issue sent to the society admin",
    onSuccess: () => setIssue(false),
  });

  const j = job.data;
  // the vendor's browser reports its position while the job is active (accepted -> completed)
  const share = useShareLocation(jobId, !!j && LIVE.includes(j.status) && shareOn);
  if (job.isLoading) return <Panel variant="soft"><PageLoader minHeight={420} /></Panel>;
  if (!j) return <Panel variant="soft"><EmptyState title="Could not load this job" /></Panel>;

  const next = NEXT[j.status];
  const done = FINAL.includes(j.status);
  const accepted = !["assigned", "rescheduled", "created"].includes(j.status);

  return (
    <Panel variant="soft" as="aside" className="flex flex-col gap-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold leading-[13px] text-muted">{j.job_no}</p>
            <h2 className="mt-0.5 text-[16px] font-bold leading-[21px] text-ink">{j.title}</h2>
          </div>
          <StatusBadge status={j.status} />
        </div>
        <p className="mt-1.5 text-[12px] leading-[15px] text-body">
          {j.scheduled_at ? `${dayMonth(j.scheduled_at)} · ${time(j.scheduled_at)}` : "Time not set"}
          {j.slot ? ` · ${j.slot}` : ""}
        </p>
      </div>

      {j.status === "assigned" && <Note tone="yellow">New job for you. Accept it to see the resident&apos;s full number.</Note>}
      {j.issue_note && <Note tone="peach">Your reported issue: {j.issue_note}</Note>}

      <div className="space-y-2 rounded-[16px] bg-white p-3.5">
        <KeyValue label="Resident" value={j.resident_name ?? "—"} />
        <KeyValue label="Flat" value={j.unit_label ?? "—"} />
        <KeyValue label="Mobile" value={j.resident_mobile ?? "—"} />
        {!accepted && <p className="text-[11px] leading-[13px] text-muted">Number is masked until you accept.</p>}
      </div>

      <div className="space-y-2 rounded-[16px] bg-white p-3.5">
        <KeyValue label="Your payout" value={inr(j.payout_amount)} />
        <div className="flex items-center justify-between text-[12px] leading-[15px]">
          <span className="text-body">Payout status</span>
          <Badge tone={j.payout_status === "paid" ? "green" : j.payout_status === "pending" ? "yellow" : "gray"}>
            {j.payout_status === "not_applicable" ? "Not applicable" : statusLabel(j.payout_status)}
          </Badge>
        </div>
        {j.payout_reference && <KeyValue label="Reference" value={j.payout_reference} />}
        {j.rating != null && <KeyValue label="Resident rating" value={`★ ${j.rating}`} />}
      </div>

      {j.notes && <p className="rounded-[14px] bg-white px-3.5 py-3 text-[12px] leading-[16px] text-body">{j.notes}</p>}

      {!done && (
        <div className="flex flex-col gap-2">
          {next && (
            <Button
              size="lg"
              variant={next.to === "completed" ? "success" : "dark"}
              loading={step.isPending && !completing}
              onClick={() => (next.to === "completed" ? setCompleting(true) : step.mutate({ to: next.to }))}
            >
              {next.label}
            </Button>
          )}
          <Button variant="warn" onClick={() => setIssue(true)}>Report issue / reschedule</Button>
        </div>
      )}

      {LIVE.includes(j.status) && (
        <div className="rounded-[16px] bg-white p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-ink">Share live location</p>
              <p className="text-[11px] leading-[14px] text-muted">The resident sees you on a map while you are on the way. Keep this page open.</p>
            </div>
            <Toggle checked={shareOn} onChange={setShareOn} label="Share live location" />
          </div>
          {shareOn && (
            <p className={`mt-2 text-[11px] font-semibold ${share.state === "sharing" ? "text-green-fg" : share.state === "starting" ? "text-body" : "text-pink-fg"}`}>
              {share.state === "sharing" ? `● Sharing now${share.sentAt ? ` · last sent ${share.sentAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}` : ""}`
                : share.state === "starting" ? "Getting your position… allow location access in the browser."
                : share.state === "denied" ? "Location is blocked. Allow it in the browser's site settings, then reload."
                : share.state === "unsupported" ? "This browser cannot share location."
                : "Could not send your position. Retrying…"}
            </p>
          )}
        </div>
      )}

      <JobChat jobId={jobId} closed={j.status === "cancelled"} title={`Chat with ${j.resident_name ?? "the resident"}`} />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase leading-[13px] tracking-[0.88px] text-muted">Timeline</p>
        <ol className="space-y-2.5">
          {j.timeline.length === 0 && <li className="text-[12px] text-muted">No updates yet.</li>}
          {j.timeline
            .slice()
            .reverse()
            .map((u) => (
              <li key={u.id} className="flex gap-2.5">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" />
                <div className="min-w-0 text-[12px] leading-[15px]">
                  <p className="font-semibold text-ink">
                    {statusLabel(u.status)} <span className="font-normal text-muted">· {relativeDay(u.created_at)}</span>
                  </p>
                  {u.note && <p className="mt-0.5 text-body">{u.note}</p>}
                  {u.photo && (
                    <button onClick={() => openFile(u.photo!)} className="mt-0.5 font-semibold text-lilac-fg hover:underline">
                      View photo
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ol>
      </div>

      <JobCompleteModal
        key={`c${j.id}${completing}`}
        open={completing}
        title={j.title}
        loading={step.isPending}
        onClose={() => setCompleting(false)}
        onConfirm={(note, photo) => step.mutate({ to: "completed", note, photo })}
      />
      <JobIssueModal
        key={`i${j.id}${issue}`}
        open={issue}
        title={j.title}
        loading={report.isPending}
        onClose={() => setIssue(false)}
        onConfirm={(note, when) => report.mutate({ note, when })}
      />
    </Panel>
  );
}
