"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, Panel, Skeleton } from "@/components/ui";
import { activityApi } from "@/lib/api/ops";
import type { ServiceJob } from "@/lib/types/deal";
import { ago, fullDate, time, titleCase } from "@/lib/utils/format";

interface Row { key: string; when: string; title: string; by: string; tag: string }

/** One timeline: admin actions on this vendor (verify, assign, hold…) + what happened on each of their jobs. */
export function VendorHistory({ partnerId, jobs }: { partnerId: number; jobs: ServiceJob[] }) {
  const log = useQuery({ queryKey: ["activity", "service_partner", partnerId], queryFn: () => activityApi.list({ entity: "service_partner", entity_id: partnerId }) });

  const rows: Row[] = [
    ...(log.data?.items ?? []).map((l) => ({ key: `a${l.id}`, when: l.created_at, title: titleCase(l.action.replace(".", " ")), by: `${l.user_name} (${titleCase(l.user_type)})`, tag: "Account" })),
    ...jobs.flatMap((j) => [
      { key: `jc${j.id}`, when: j.created_at, title: `Job ${j.job_no} · ${j.title} assigned`, by: "Society admin", tag: "Job" },
      ...(j.completed_at ? [{ key: `jd${j.id}`, when: j.completed_at, title: `Job ${j.job_no} completed${j.rating != null ? ` · rated ★ ${j.rating}` : ""}`, by: "Vendor", tag: "Job" }] : []),
      ...(j.payout_status === "paid" ? [{ key: `jp${j.id}`, when: j.completed_at ?? j.created_at, title: `Payout paid for ${j.job_no}${j.payout_reference ? ` · ref ${j.payout_reference}` : ""}`, by: "Admin", tag: "Payout" }] : []),
    ]),
  ].sort((a, b) => b.when.localeCompare(a.when));

  return (
    <Panel>
      {log.isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : rows.length === 0 ? (
        <EmptyState title="No history yet" />
      ) : (
        <ol className="space-y-3.5">
          {rows.map((r) => (
            <li key={r.key} className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-4 text-ink">{r.title}</p>
                <p className="text-[11px] text-muted">{r.by} · {fullDate(r.when)} {time(r.when)} · {ago(r.when)}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted">{r.tag}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
