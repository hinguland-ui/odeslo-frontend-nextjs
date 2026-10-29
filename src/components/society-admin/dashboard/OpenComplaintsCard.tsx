"use client";

import Link from "next/link";
import { Badge, EmptyState, Panel, Skeleton } from "@/components/ui";
import type { Complaint } from "@/lib/types/ops";
import { ago, sentence } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";
import { TONE } from "@/lib/utils/tones";

export function OpenComplaintsCard({ complaints, loading }: { complaints?: Complaint[]; loading: boolean }) {
  const urgent = complaints?.filter((c) => c.priority === "urgent").length ?? 0;
  return (
    <Panel className="flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold leading-[21px] text-ink">Open complaints</h2>
        <span className="text-[12px] leading-[15px] text-muted">
          {complaints?.length ?? 0} open · {urgent} urgent
        </span>
      </div>
      <div className="mt-2.5 space-y-2.5">
        {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[29px]" />)}
        {!loading && !complaints?.length && <EmptyState title="No open complaints" className="py-8" />}
        {complaints?.slice(0, 6).map((c) => {
          const tone = c.priority === "urgent" ? "pink" : statusTone(c.status);
          return (
            <Link key={c.id} href="/society/complaints" className="flex items-center gap-2.5 rounded-[10px] transition hover:bg-row-hi">
              <span className={`size-2 shrink-0 rounded-full ${TONE[tone].dot}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-4 text-ink">{c.description}</p>
                <p className="truncate text-[11px] leading-[13px] text-muted">
                  {sentence(c.category)} · {c.complaint_no} · {ago(c.created_at)}
                </p>
              </div>
              <Badge tone={tone} dot={false}>
                {c.priority === "urgent" ? "Urgent" : statusLabel(c.status)}
              </Badge>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}
