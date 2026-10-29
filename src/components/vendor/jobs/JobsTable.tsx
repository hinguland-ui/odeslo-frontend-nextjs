"use client";

import { Badge, CellTitle, DataTable, EmptyState, StatusBadge, type Column } from "@/components/ui";
import type { ServiceJob } from "@/lib/types/deal";
import { dayMonth, inr, time } from "@/lib/utils/format";

export function JobsTable({
  jobs,
  loading,
  selectedId,
  onSelect,
  emptyTitle,
}: {
  jobs: ServiceJob[] | undefined;
  loading?: boolean;
  selectedId?: number | null;
  onSelect: (id: number) => void;
  emptyTitle: string;
}) {
  const columns: Column<ServiceJob>[] = [
    { key: "j", header: "Job", width: "1.6fr", render: (j) => <CellTitle title={j.title} sub={j.job_no} /> },
    {
      key: "w", header: "When", width: "1fr",
      render: (j) =>
        j.scheduled_at ? (
          <CellTitle title={dayMonth(j.scheduled_at)} sub={`${time(j.scheduled_at)}${j.slot ? ` · ${j.slot}` : ""}`} />
        ) : (
          <span className="text-muted">Not set</span>
        ),
    },
    { key: "p", header: "Payout", width: "0.7fr", render: (j) => <span className="font-semibold">{inr(j.payout_amount)}</span> },
    { key: "s", header: "Status", width: "0.9fr", render: (j) => <StatusBadge status={j.status} /> },
    { key: "i", header: "", width: "70px", render: (j) => (j.issue_note ? <Badge tone="peach" size="sm" dot={false}>Issue</Badge> : null) },
  ];
  return (
    <DataTable
      columns={columns}
      rows={jobs}
      rowKey={(j) => j.id}
      loading={loading}
      rowHeight={53}
      onRowClick={(j) => onSelect(j.id)}
      selectedKey={selectedId}
      className="min-h-[560px]"
      empty={<EmptyState title={emptyTitle} hint="Jobs assigned to you by a society admin will appear here." />}
    />
  );
}
