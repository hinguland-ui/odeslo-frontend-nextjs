"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, Panel, Skeleton } from "@/components/ui";
import { activityApi } from "@/lib/api/ops";
import { ago, fullDate, time, titleCase } from "@/lib/utils/format";

/** Audit trail of everything done inside this society (approvals, deals, payments, edits…). */
export function SocietyActivity({ societyId }: { societyId: number }) {
  const log = useQuery({ queryKey: ["activity", "society", societyId], queryFn: () => activityApi.list({ society_id: societyId }) });
  const rows = log.data?.items ?? [];
  return (
    <Panel>
      {log.isLoading ? <Skeleton className="h-[240px] w-full" /> : rows.length === 0 ? <EmptyState title="No activity yet" /> : (
        <>
          <ol className="space-y-3.5">
            {rows.map((l) => (
              <li key={l.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-4 text-ink">{titleCase(l.action.replace(".", " "))}{l.entity_id ? <span className="font-normal text-muted"> · {titleCase(l.entity)} #{l.entity_id}</span> : null}</p>
                  <p className="text-[11px] text-muted">{l.user_name} ({titleCase(l.user_type)}) · {fullDate(l.created_at)} {time(l.created_at)} · {ago(l.created_at)}</p>
                </div>
              </li>
            ))}
          </ol>
          {log.data && log.data.total > rows.length && <p className="mt-4 text-[11px] text-muted">Showing the latest {rows.length} of {log.data.total} entries.</p>}
        </>
      )}
    </Panel>
  );
}
