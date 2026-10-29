"use client";

import Link from "next/link";
import { Avatar, Eyebrow, Panel, Skeleton } from "@/components/ui";
import type { Resident } from "@/lib/types/resident";
import { sentence, unitLabel } from "@/lib/utils/format";

/** Dark "PENDING APPROVALS · n" card on the dashboard. */
export function PendingApprovalsCard({ residents, total, loading }: { residents?: Resident[]; total: number; loading: boolean }) {
  return (
    <Panel variant="dark">
      <div className="flex items-center justify-between">
        <Eyebrow className="text-violet-soft">Pending approvals · {total}</Eyebrow>
        <Link href="/society/approvals" className="text-[12px] font-semibold leading-[15px] text-white hover:underline">
          Review
        </Link>
      </div>
      <div className="mt-2.5 space-y-2.5">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 !bg-night" />)}
        {!loading && !residents?.length && (
          <p className="rounded-[14px] bg-night px-3.5 py-3.5 text-[12px] text-night-muted">All caught up. No one is waiting.</p>
        )}
        {residents?.slice(0, 3).map((r) => (
          <Link key={r.id} href={`/society/approvals?id=${r.id}`}
            className="flex h-12 items-center gap-2.5 rounded-[14px] bg-night px-2.5 transition hover:bg-night-line">
            <Avatar name={r.name} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-4 text-white">{r.name}</p>
              <p className="truncate text-[11px] leading-[13px] text-night-muted">
                {unitLabel(r.wing_name, r.unit_no)} · {sentence(r.resident_type)}
              </p>
            </div>
            <span className={`pr-1 text-[11px] font-semibold ${r.unit_occupied_flag ? "text-rose-soft" : "text-violet-soft"}`}>
              {r.unit_occupied_flag ? "Unit occupied" : "New"}
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
