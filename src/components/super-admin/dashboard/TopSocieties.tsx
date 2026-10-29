"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Avatar, EmptyState, Panel, Skeleton } from "@/components/ui";
import { societiesApi } from "@/lib/api/societies";
import type { Society } from "@/lib/types/society";
import { initials, inrShort } from "@/lib/utils/format";
import { toneAt } from "@/lib/utils/tones";

export interface SocietyRank {
  society: Society;
  gmv: number;
  deals: number;
}

/** Societies ranked by deal GMV; unit counts come from each society's detail stats. */
export function TopSocieties({ ranks, loading }: { ranks: SocietyRank[]; loading: boolean }) {
  const top = ranks.slice(0, 6);
  const details = useQueries({
    queries: top.map((r) => ({ queryKey: ["society", r.society.id], queryFn: () => societiesApi.get(r.society.id), staleTime: 60_000 })),
  });

  return (
    <Panel className="flex-1">
      <h2 className="text-[16px] font-bold leading-[21px] text-ink">Top societies</h2>
      <div className="mt-2.5 space-y-2.5">
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
        {!loading && !top.length && <EmptyState title="No societies yet" className="py-8" />}
        {top.map((r, i) => {
          const units = details[i]?.data?.stats.units;
          return (
            <Link key={r.society.id} href="/admin/societies" className="flex items-center gap-2.5 rounded-[10px] transition hover:bg-row-hi">
              <Avatar label={initials(r.society.name, 3)} tone={toneAt(i + 1)} size={32} shape="rounded" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-4 text-ink">{r.society.name}</p>
                <p className="truncate text-[11px] leading-[13px] text-muted">
                  {r.society.city} · {units ?? "…"} units · {r.deals} deal{r.deals === 1 ? "" : "s"}
                </p>
              </div>
              <span className="text-[13px] font-bold leading-4 text-ink">{inrShort(r.gmv)}</span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}
