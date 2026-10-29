"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, EmptyState, Panel, PanelTitle, Skeleton, StatCard } from "@/components/ui";
import { vendorApi } from "@/lib/api/vendor";
import type { Partner } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { dayMonth, initials } from "@/lib/utils/format";
import { toneFor, TONE } from "@/lib/utils/tones";
import clsx from "clsx";

/** Services the vendor offers + the societies assigned to them and how many vendors serve each. */
export function SocietiesPanel({ partner }: { partner: Partner }) {
  const societies = useQuery({ queryKey: ["vendor", "societies"], queryFn: vendorApi.societies });
  const list = societies.data ?? [];
  const mine = new Set(partner.categories);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="blue" label="Societies assigned" value={list.length} loading={societies.isLoading} sub="Where you can get deals" />
        <StatCard tone="lilac" label="Services offered" value={partner.categories.length} sub="Your categories" />
        <StatCard tone="yellow" label="Open deals for you" value={list.reduce((s, x) => s + x.open_deals, 0)} loading={societies.isLoading} sub="Matching your services" />
        <StatCard tone="green" label="Jobs done there" value={list.reduce((s, x) => s + x.my_jobs, 0)} loading={societies.isLoading} sub="Across all societies" />
      </div>

      <Panel>
        <PanelTitle aside={`${partner.categories.length} selected`}>Your services</PanelTitle>
        <div className="flex flex-wrap gap-2">
          {partner.categories.length === 0 && <span className="text-[12px] text-muted">No services selected.</span>}
          {partner.categories.map((c) => (
            <Badge key={c} tone={categoryOf(c).tone} dot={false}>{categoryOf(c).label}</Badge>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle aside="Vendors = verified, active vendors in that society">Your societies</PanelTitle>
        {societies.isLoading ? (
          <Skeleton className="h-[160px] w-full" />
        ) : list.length === 0 ? (
          <EmptyState title="No society assigned yet" hint="The Odeslo team assigns societies to you after verification. Contact support to request one." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {list.map((s) => {
              const t = TONE[toneFor(s.id)];
              const cats = Object.entries(s.vendors_by_category).sort((a, b) => b[1] - a[1]);
              return (
                <li key={s.id} className="rounded-[20px] bg-panel p-3.5">
                  <div className="flex items-center gap-3">
                    <span className={clsx("grid size-10 shrink-0 place-items-center rounded-[12px] text-[13px] font-bold", t.bg, t.fg)}>{initials(s.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold leading-[18px] text-ink">{s.name}</p>
                      <p className="truncate text-[11px] text-muted">{s.area}, {s.city}{s.assigned_at ? ` · since ${dayMonth(s.assigned_at)}` : ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-[12px] bg-white px-2 py-2">
                      <p className="text-[16px] font-bold text-ink">{s.vendors_total}</p>
                      <p className="text-[10px] leading-3 text-muted">Vendors here</p>
                    </div>
                    <div className="rounded-[12px] bg-white px-2 py-2">
                      <p className="text-[16px] font-bold text-ink">{s.vendors_same_category}</p>
                      <p className="text-[10px] leading-3 text-muted">Same service as you</p>
                    </div>
                    <div className="rounded-[12px] bg-white px-2 py-2">
                      <p className="text-[16px] font-bold text-ink">{s.open_deals}</p>
                      <p className="text-[10px] leading-3 text-muted">Open deals</p>
                    </div>
                  </div>
                  {cats.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cats.map(([c, n]) => (
                        <Badge key={c} size="sm" dot={false} tone={mine.has(c) ? categoryOf(c).tone : "gray"}>
                          {categoryOf(c).label} · {n}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-muted">{s.my_jobs} job{s.my_jobs === 1 ? "" : "s"} done by you here</p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
