"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, Badge, Button, CellTitle, DataTable, EmptyState, PageHeader, Panel, type Column } from "@/components/ui";
import { AddVendorModal } from "@/components/super-admin/vendors/AddVendorModal";
import { VendorAside, vendorStatus } from "@/components/super-admin/vendors/VendorAside";
import { useLookups } from "@/hooks/useLookups";
import { dashboardApi } from "@/lib/api/dashboard";
import { partnersApi } from "@/lib/api/deals";
import type { Partner } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { num } from "@/lib/utils/format";

export default function VendorsPage() {
  const look = useLookups();
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersApi.list() });
  const jobs = useQuery({ queryKey: ["reports", "jobs"], queryFn: () => dashboardApi.jobsReport() });

  const list = (partners.data?.items ?? []).slice().sort((a, b) => Number(a.verified) - Number(b.verified) || a.name.localeCompare(b.name));
  const toVerify = list.filter((p) => !p.verified && p.status === "active").length;
  const jobsFor = (id: number) =>
    jobs.data?.filter((r) => r.assignee_type === "partner" && r.assignee_id === id).reduce((s, r) => s + r.jobs, 0) ?? 0;
  const selected = list.find((p) => p.id === selectedId) ?? list.find((p) => !p.verified) ?? list[0];

  const columns: Column<Partner>[] = [
    {
      key: "v", header: "Vendor", width: "1.6fr",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={p.business_name ?? p.name} size={32} shape="rounded" />
          <CellTitle title={p.business_name ?? p.name} sub={p.name} />
        </div>
      ),
    },
    { key: "c", header: "Category", width: "1.1fr", render: (p) => <span className="text-body">{p.categories.map((c) => categoryOf(c).label).join(", ")}</span> },
    { key: "s", header: "Societies", width: "0.7fr", render: (p) => p.society_ids.length },
    { key: "r", header: "Rating", width: "0.6fr", render: (p) => <span className="font-semibold">{p.rating_count ? `★ ${p.rating_avg.toFixed(1)}` : "—"}</span> },
    { key: "j", header: "Jobs", width: "0.6fr", render: (p) => num(jobsFor(p.id)) },
    { key: "st", header: "Status", width: "0.8fr", render: (p) => { const s = vendorStatus(p); return <Badge tone={s.tone}>{s.label}</Badge>; } },
  ];

  return (
    <>
      <PageHeader
        title="Vendors,"
        light={`${list.length} partners · ${toVerify} to verify.`}
        actions={<Button plus onClick={() => setAdding(true)}>Add vendor</Button>}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <DataTable
          columns={columns}
          rows={list}
          rowKey={(p) => p.id}
          loading={partners.isLoading}
          rowHeight={53}
          onRowClick={(p) => setSelectedId(p.id)}
          selectedKey={selected?.id}
          className="min-h-[712px]"
          empty={<EmptyState title="No vendors yet" action={<Button size="sm" onClick={() => setAdding(true)}>Add vendor</Button>} />}
        />
        {selected ? (
          <VendorAside key={selected.id + String(selected.society_ids)} partner={selected} societies={look.societies} />
        ) : (
          <Panel variant="soft"><EmptyState title="Select a vendor" /></Panel>
        )}
      </div>
      <AddVendorModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
