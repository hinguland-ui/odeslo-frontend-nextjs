"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, CellTitle, DataTable, Note, PageHeader, Toggle, type Column } from "@/components/ui";
import { FEATURE_LABELS } from "@/components/super-admin/societies/onboard/FeaturesStep";
import { useAction } from "@/hooks/useAction";
import { societiesApi } from "@/lib/api/societies";
import type { FeatureKey, Features, Society } from "@/lib/types/society";

const KEYS = Object.keys(FEATURE_LABELS) as FeatureKey[];

export default function FeatureControlsPage() {
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societiesApi.list() });
  const rows = societies.data?.items ?? [];
  const details = useQueries({
    queries: rows.map((s) => ({ queryKey: ["society", s.id], queryFn: () => societiesApi.get(s.id), staleTime: 60_000 })),
  });
  const units = new Map(details.map((d) => [d.data?.id, d.data?.stats.units]));
  const [edits, setEdits] = useState<Record<number, Features>>({});

  const value = (s: Society, k: FeatureKey) => (edits[s.id] ?? s.features)[k] ?? false;
  const toggle = (s: Society, k: FeatureKey, v: boolean) =>
    setEdits((e) => ({ ...e, [s.id]: { ...(e[s.id] ?? s.features), [k]: v } }));

  const save = useAction(() => Promise.all(Object.entries(edits).map(([id, f]) => societiesApi.setFeatures(Number(id), f))), {
    success: (r) => `Features saved for ${r.length} societ${r.length === 1 ? "y" : "ies"}`,
    invalidate: [["societies"], ["society"]],
    onSuccess: () => setEdits({}),
  });

  const columns: Column<Society>[] = [
    {
      key: "s", header: "Society", width: "1.7fr",
      render: (s) => <CellTitle title={s.name} sub={s.status === "active" ? `${s.city} · ${units.get(s.id) ?? "…"} units` : s.status === "pending" ? "Onboarding" : "Suspended"} />,
    },
    ...KEYS.map((k) => ({
      key: k, header: FEATURE_LABELS[k].label, width: "1fr", className: "flex justify-center",
      render: (s: Society) => <Toggle checked={value(s, k)} onChange={(v) => toggle(s, k, v)} label={`${FEATURE_LABELS[k].label} for ${s.name}`} />,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Feature controls,"
        light="per society."
        subtitle="Turning a module off hides it for that society's admin and residents. Data is kept."
        actions={
          <>
            {!!Object.keys(edits).length && <Button variant="light" onClick={() => setEdits({})}>Discard</Button>}
            <Button disabled={!Object.keys(edits).length} loading={save.isPending} onClick={() => save.mutate(undefined)}>Save changes</Button>
          </>
        }
      />
      <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} loading={societies.isLoading} rowHeight={54} className="min-h-[632px]" />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Note tone="green" className="!rounded-[20px] !px-4 !py-3.5">Masjid &amp; Namaz stays visible to pending residents so new users see value before approval.</Note>
        <Note tone="yellow" className="!rounded-[20px] !px-4 !py-3.5">Group deals need at least one verified vendor assigned to that society.</Note>
        <Note tone="lilac" className="!rounded-[20px] !px-4 !py-3.5">Staff app gives guards and helpers their own login for assigned jobs.</Note>
      </div>
    </>
  );
}
