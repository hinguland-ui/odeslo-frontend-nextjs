"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, CellTitle, ChipGroup, DataTable, EmptyState, PageHeader, Panel, StatusBadge, type Column } from "@/components/ui";
import { JobAside } from "@/components/society-admin/service-jobs/JobAside";
import { jobsApi } from "@/lib/api/deals";
import type { ServiceJob } from "@/lib/types/deal";
import { dayMonth, inr, time } from "@/lib/utils/format";

type Filter = "all" | "unassigned" | "escalated" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unassigned", label: "Unassigned" },
  { value: "escalated", label: "Needs attention" },
  { value: "active", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function SocietyServiceJobsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const jobs = useQuery({ queryKey: ["jobs", "list"], queryFn: () => jobsApi.list(), refetchInterval: 60_000 });

  const all = jobs.data?.items ?? [];
  const rows = all.filter((j) => {
    if (filter === "unassigned") return !j.assigned_to_id && !["completed", "cancelled"].includes(j.status);
    if (filter === "escalated") return j.escalated || !!j.issue_note || j.status === "rescheduled";
    if (filter === "active") return ["assigned", "accepted", "on_the_way", "started"].includes(j.status);
    if (filter === "completed") return j.status === "completed";
    return true;
  });
  const selected = rows.find((j) => j.id === selectedId) ?? rows[0];
  const attention = all.filter((j) => j.escalated || !!j.issue_note).length;

  const columns: Column<ServiceJob>[] = [
    { key: "j", header: "Job", width: "1.6fr", render: (j) => <CellTitle title={j.title} sub={j.job_no} /> },
    {
      key: "w", header: "When", width: "1fr",
      render: (j) => (j.scheduled_at ? <CellTitle title={dayMonth(j.scheduled_at)} sub={time(j.scheduled_at)} /> : <span className="text-muted">Not set</span>),
    },
    {
      key: "a", header: "Assigned to", width: "0.9fr",
      render: (j) => (j.assigned_to_id ? <span className="capitalize text-body">{j.assigned_to_type} #{j.assigned_to_id}</span> : <Badge tone="yellow" dot={false}>Unassigned</Badge>),
    },
    { key: "p", header: "Payout", width: "0.7fr", render: (j) => (j.payout_amount != null ? inr(j.payout_amount) : "—") },
    { key: "s", header: "Status", width: "0.9fr", render: (j) => <StatusBadge status={j.status} /> },
  ];

  return (
    <>
      <PageHeader title="Service jobs," light={`${all.length} total · ${attention} need attention.`} subtitle="Assign group-deal bookings to vendors or staff and record vendor payouts." />
      <ChipGroup
        className="mb-4"
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setSelectedId(null);
        }}
        options={FILTERS}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(j) => j.id}
          loading={jobs.isLoading}
          rowHeight={53}
          onRowClick={(j) => setSelectedId(j.id)}
          selectedKey={selected?.id}
          className="min-h-[560px]"
          empty={<EmptyState title="No jobs here" hint="Create jobs from a completed group deal's page." />}
        />
        {selected ? <JobAside key={selected.id} jobId={selected.id} /> : <Panel variant="soft"><EmptyState title="Select a job" /></Panel>}
      </div>
    </>
  );
}
