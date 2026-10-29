"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Button, EmptyState, PageHeader, Panel, Skeleton, StatCard } from "@/components/ui";
import { Legend, UnitGrid } from "@/components/society-admin/units/UnitGrid";
import { AddUnitModal, BulkUploadModal } from "@/components/society-admin/units/UnitModals";
import { useMe } from "@/hooks/useMe";
import { residentsApi } from "@/lib/api/residents";
import { societiesApi } from "@/lib/api/societies";

export default function UnitsPage() {
  const me = useMe();
  const sid = me.data?.society_id ?? 0;
  const [wingId, setWingId] = useState<number | null>(null);
  const [modal, setModal] = useState<"add" | "bulk" | null>(null);

  const wings = useQuery({ queryKey: ["wings", sid], queryFn: () => societiesApi.wings(sid), enabled: !!sid });
  const units = useQuery({ queryKey: ["units", sid], queryFn: () => societiesApi.units(sid), enabled: !!sid });
  const residents = useQuery({ queryKey: ["residents", "active"], queryFn: () => residentsApi.list({ status: "active" }) });
  const pending = useQuery({ queryKey: ["residents", "pending"], queryFn: residentsApi.pending });

  const all = units.data?.items ?? [];
  const activeWing = wings.data?.find((w) => w.id === wingId) ?? wings.data?.[0];
  const pendingUnits = new Set(pending.data?.items.map((r) => r.unit_id));
  const count = (s: string) => all.filter((u) => u.occupancy_status === s).length;

  return (
    <>
      <PageHeader
        title="Units,"
        light={`${units.data?.total ?? 0} across ${wings.data?.length ?? 0} wings.`}
        actions={<><Button variant="light" onClick={() => setModal("bulk")}>Bulk upload CSV</Button><Button plus onClick={() => setModal("add")}>Add unit</Button></>}
      />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="sm" tone="lilac" label="Owner occupied" value={count("owner")} loading={units.isLoading} />
        <StatCard size="sm" tone="blue" label="Tenant occupied" value={count("tenant")} loading={units.isLoading} />
        <StatCard size="sm" tone="gray" label="Vacant" value={count("vacant")} loading={units.isLoading} />
        <StatCard size="sm" tone="yellow" label="Pending approval" value={pending.data?.total ?? 0} loading={pending.isLoading} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex h-11 items-center gap-1 rounded-[22px] bg-mist p-1">
          {wings.data?.map((w) => (
            <button key={w.id} onClick={() => setWingId(w.id)}
              className={clsx("h-9 rounded-[18px] px-[18px] text-[13px] leading-4", activeWing?.id === w.id ? "bg-ink font-semibold text-white" : "font-medium text-body hover:text-ink")}>
              Wing {w.name} · {all.filter((u) => u.wing_id === w.id).length}
            </button>
          ))}
        </div>
        <Legend />
      </div>

      <Panel className="min-h-[559px]">
        {units.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[34px]" />)}</div>
        ) : !activeWing ? (
          <EmptyState title="No wings yet" />
        ) : (
          <UnitGrid
            units={all.filter((u) => u.wing_id === activeWing.id)}
            wingName={activeWing.name}
            residents={residents.data?.items ?? []}
            pendingUnits={pendingUnits}
          />
        )}
      </Panel>

      {modal === "add" && <AddUnitModal open onClose={() => setModal(null)} societyId={sid} wings={wings.data ?? []} defaultWing={activeWing?.id} />}
      {modal === "bulk" && <BulkUploadModal open onClose={() => setModal(null)} societyId={sid} />}
    </>
  );
}
