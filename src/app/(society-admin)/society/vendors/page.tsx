"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, Badge, CellTitle, Chip, DataTable, EmptyState, Note, PageHeader, StatCard, type Column } from "@/components/ui";
import { dealsApi, jobsApi, partnersApi } from "@/lib/api/deals";
import type { PartnerBrief } from "@/lib/types/deal";
import { CATEGORY_KEYS, categoryOf } from "@/lib/utils/categories";

/** Verified vendors the Odeslo team has assigned to this society. */
export default function SocietyVendorsPage() {
  const [category, setCategory] = useState<string>("all");
  const vendors = useQuery({ queryKey: ["partners", "available", "all"], queryFn: () => partnersApi.available() });
  const deals = useQuery({ queryKey: ["deals", "all"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const jobs = useQuery({ queryKey: ["jobs", "list"], queryFn: () => jobsApi.list() });

  const all = vendors.data ?? [];
  const covered = CATEGORY_KEYS.filter((c) => all.some((v) => v.categories.includes(c)));
  const rows = all.filter((v) => category === "all" || v.categories.includes(category));
  const rated = all.filter((v) => v.rating_count > 0);
  const avg = rated.length ? rated.reduce((s, v) => s + v.rating_avg, 0) / rated.length : null;

  const dealsOf = (id: number) => deals.data?.items.filter((d) => d.partner_id === id).length ?? 0;
  const jobsOf = (id: number) => jobs.data?.items.filter((j) => j.assigned_to_type === "partner" && j.assigned_to_id === id) ?? [];

  const columns: Column<PartnerBrief>[] = [
    {
      key: "v", header: "Vendor", width: "1.5fr",
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={v.business_name ?? v.name} size={32} shape="rounded" />
          <CellTitle title={v.business_name ?? v.name} sub={v.business_name ? v.name : undefined} />
        </div>
      ),
    },
    {
      key: "c", header: "Services", width: "1.6fr",
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.categories.map((c) => (
            <Badge key={c} size="sm" dot={false} tone={categoryOf(c).tone}>{categoryOf(c).label}</Badge>
          ))}
        </div>
      ),
    },
    { key: "r", header: "Rating", width: "0.7fr", render: (v) => <span className="font-semibold">{v.rating_count ? `★ ${v.rating_avg.toFixed(1)} (${v.rating_count})` : "—"}</span> },
    { key: "d", header: "Deals awarded", width: "0.8fr", render: (v) => dealsOf(v.id) },
    {
      key: "j", header: "Jobs (done / all)", width: "0.9fr",
      render: (v) => {
        const js = jobsOf(v.id);
        return `${js.filter((j) => j.status === "completed").length} / ${js.length}`;
      },
    },
  ];

  return (
    <>
      <PageHeader title="Vendors," light={`${all.length} serving your society.`} subtitle="Verified service providers assigned to your society by the Odeslo team." />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="md" tone="blue" label="Vendors" value={all.length} loading={vendors.isLoading} sub="Verified and active" />
        <StatCard size="md" tone="lilac" label="Services covered" value={covered.length} loading={vendors.isLoading} sub={`of ${CATEGORY_KEYS.length} categories`} />
        <StatCard size="md" tone="peach" label="Average rating" value={avg != null ? `★ ${avg.toFixed(1)}` : "—"} loading={vendors.isLoading} sub={`${rated.length} rated vendors`} />
        <StatCard size="md" tone="green" label="Deals awarded" value={deals.data?.items.filter((d) => d.partner_id).length ?? 0} loading={deals.isLoading} sub="To vendors so far" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Chip size="sm" active={category === "all"} onClick={() => setCategory("all")}>All · {all.length}</Chip>
        {covered.map((c) => (
          <Chip key={c} size="sm" active={category === c} onClick={() => setCategory(c)}>
            {categoryOf(c).label} · {all.filter((v) => v.categories.includes(c)).length}
          </Chip>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(v) => v.id}
        loading={vendors.isLoading}
        rowHeight={58}
        className="min-h-[360px]"
        empty={<EmptyState title="No vendors for your society yet" hint="Ask the Odeslo team to assign verified vendors to your society." />}
      />
      <Note tone="lilac" className="mt-4">
        Vendors are verified and assigned to societies by the Odeslo team. Award a group deal from <strong>Group deals</strong>, then assign jobs from <strong>Service jobs</strong>.
      </Note>
    </>
  );
}
