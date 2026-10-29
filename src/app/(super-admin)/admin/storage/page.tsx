"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, DataTable, EmptyState, Note, PageHeader, Progress, SearchInput, StatCard, StatusBadge, type Column } from "@/components/ui";
import { storageApi } from "@/lib/api/ops";
import type { StorageRow } from "@/lib/types/ops";
import { formatBytes, num, titleCase } from "@/lib/utils/format";

const CATEGORY: Record<string, string> = {
  residents_documents: "Resident proofs", residents_photos: "Resident photos", complaints: "Complaints", requests: "Requests",
  deals: "Deal images", announcements: "Notices", masjids: "Masjids", societies: "Logos", society_admins: "Admin documents",
  staff_documents: "Staff IDs", staff_photos: "Staff photos", staff: "Staff", jobs: "Job photos", partners: "Vendor documents",
  partners_documents: "Vendor IDs", partners_photos: "Vendor photos", unlinked: "Unlinked",
};
const label = (c: string) => CATEGORY[c] ?? titleCase(c);

/** How much space each society uses (informational: nobody is capped). */
export default function StoragePage() {
  const [q, setQ] = useState("");
  const usage = useQuery({ queryKey: ["storage", "usage"], queryFn: storageApi.usage, refetchInterval: 60_000 });
  const u = usage.data;

  const needle = q.trim().toLowerCase();
  const rows: StorageRow[] = (u?.societies ?? []).filter((s) => !needle || `${s.name} ${s.code}`.toLowerCase().includes(needle));
  const biggest = Math.max(1, ...(u?.societies ?? []).map((s) => s.bytes), u?.platform.bytes ?? 0);
  const active = (u?.societies ?? []).filter((s) => s.files > 0).length;

  const top = (r: { by_category: StorageRow["by_category"] }) =>
    Object.entries(r.by_category).sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 3);

  const columns: Column<StorageRow>[] = [
    { key: "n", header: "Society", width: "1.5fr", render: (s) => <div className="min-w-0"><p className="truncate text-[13px] font-semibold text-ink">{s.name}</p><p className="text-[11px] text-muted">Code {s.code}</p></div> },
    { key: "f", header: "Files", width: "0.6fr", render: (s) => num(s.files) },
    { key: "b", header: "Used", width: "1.1fr", render: (s) => <div><p className="text-[13px] font-bold text-ink">{formatBytes(s.bytes)}</p><Progress className="mt-1 w-[110px]" value={s.bytes} max={biggest} barClass="bg-violet" /></div> },
    { key: "c", header: "What is in it", width: "2fr", render: (s) => (s.files ? <div className="flex flex-wrap gap-1">{top(s).map(([c, v]) => <Badge key={c} tone="gray" size="sm" dot={false}>{label(c)} · {formatBytes(v.bytes)}</Badge>)}</div> : <span className="text-muted">No uploads yet</span>) },
    { key: "s", header: "Status", width: "0.8fr", render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <>
      <PageHeader title="Storage," light="what each society has uploaded." subtitle="Photos and documents, encrypted on the server. This only shows usage: no society has a limit." />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="lg" tone="lilac" label="Total used" value={formatBytes(u?.total_bytes)} loading={usage.isLoading} sub="All societies + platform" />
        <StatCard size="lg" tone="blue" label="Files" value={num(u?.total_files)} loading={usage.isLoading} sub="Photos and documents" />
        <StatCard size="lg" tone="green" label="Societies uploading" value={active} loading={usage.isLoading} sub={`of ${u?.societies.length ?? 0}`} />
        <StatCard size="lg" tone="peach" label="Platform level" value={formatBytes(u?.platform.bytes)} loading={usage.isLoading} sub={`${num(u?.platform.files)} files · vendor documents`} />
      </div>

      <div className="mb-3"><SearchInput value={q} onChange={setQ} placeholder="Society or code" className="!h-11 w-[300px] !rounded-[22px]" /></div>
      <DataTable columns={columns} rows={rows} rowKey={(s) => s.society_id} loading={usage.isLoading} rowHeight={62} className="min-h-[300px]" empty={<EmptyState title="No societies yet" />} />

      {u && u.platform.files > 0 && (
        <Note tone="lilac" className="mt-4">
          <strong>Platform level ({formatBytes(u.platform.bytes)}):</strong>{" "}
          {top(u.platform).map(([c, v]) => `${label(c)} ${formatBytes(v.bytes)}`).join(" · ")}. These files belong to Odeslo, not to a society (vendor IDs and photos).
        </Note>
      )}
    </>
  );
}
