"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { EmptyState, Panel, PanelTitle, Progress, Skeleton } from "@/components/ui";
import { societiesApi } from "@/lib/api/societies";

const TONE: Record<string, string> = { owner: "bg-green-bg text-green-fg", tenant: "bg-blue-bg text-blue-fg", vacant: "bg-mist text-muted" };

/** Each wing as a grid of flats: green = owner lives there, blue = tenant, grey = vacant. */
export function SocietyUnits({ societyId }: { societyId: number }) {
  const wings = useQuery({ queryKey: ["society", societyId, "wings"], queryFn: () => societiesApi.wings(societyId) });
  const units = useQueries({
    queries: (wings.data ?? []).map((w) => ({ queryKey: ["society", societyId, "units", w.id], queryFn: () => societiesApi.units(societyId, { wing_id: w.id }) })),
  });

  if (wings.isLoading) return <Skeleton className="h-[240px] w-full" />;
  if (!wings.data?.length) return <Panel><EmptyState title="No wings added yet" /></Panel>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-[11px] text-muted">
        {(["owner", "tenant", "vacant"] as const).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={clsx("size-3 rounded", TONE[k])} />{k[0]!.toUpperCase() + k.slice(1)}</span>)}
      </div>
      {wings.data.map((w, i) => {
        const list = units[i]?.data?.items ?? [];
        const taken = list.filter((u) => u.occupancy_status !== "vacant").length;
        return (
          <Panel key={w.id}>
            <PanelTitle aside={`${taken} of ${list.length} occupied`}>Wing {w.name}</PanelTitle>
            <Progress value={taken} max={list.length} className="mb-3" barClass="bg-green-fg" />
            {units[i]?.isLoading ? <Skeleton className="h-16 w-full" /> : (
              <div className="flex flex-wrap gap-1.5">
                {list.map((u) => (
                  <span key={u.id} title={`${w.name}-${u.unit_no} · ${u.occupancy_status}`} className={clsx("grid h-9 min-w-[52px] place-items-center rounded-[10px] px-2 text-[12px] font-bold", TONE[u.occupancy_status] ?? TONE.vacant)}>
                    {u.unit_no}
                  </span>
                ))}
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
