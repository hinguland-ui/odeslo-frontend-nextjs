"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, CellTitle, DataTable, EmptyState, PageHeader, StatCard, type Column } from "@/components/ui";
import { vendorApi } from "@/lib/api/vendor";
import type { ServiceJob } from "@/lib/types/deal";
import { fullDate, inr, num } from "@/lib/utils/format";
import { statusLabel } from "@/lib/utils/status";

export default function VendorEarningsPage() {
  const earnings = useQuery({ queryKey: ["vendor", "earnings"], queryFn: vendorApi.earnings });
  const history = useQuery({ queryKey: ["vendor", "jobs", "history"], queryFn: () => vendorApi.jobs("history") });
  const e = earnings.data;

  const rows = (history.data ?? []).filter((j) => j.status === "completed");

  const columns: Column<ServiceJob>[] = [
    { key: "j", header: "Job", width: "1.6fr", render: (j) => <CellTitle title={j.title} sub={j.job_no} /> },
    { key: "d", header: "Completed", width: "1fr", render: (j) => fullDate(j.completed_at) },
    { key: "a", header: "Amount", width: "0.8fr", render: (j) => <span className="font-semibold">{inr(j.payout_amount)}</span> },
    {
      key: "s", header: "Payout", width: "0.9fr",
      render: (j) => (
        <Badge tone={j.payout_status === "paid" ? "green" : j.payout_status === "pending" ? "yellow" : "gray"}>
          {j.payout_status === "not_applicable" ? "N/A" : statusLabel(j.payout_status)}
        </Badge>
      ),
    },
    { key: "r", header: "Reference", width: "1fr", render: (j) => <span className="text-body">{j.payout_reference ?? "—"}</span> },
    { key: "rt", header: "Rating", width: "0.6fr", render: (j) => (j.rating != null ? `★ ${j.rating}` : "—") },
  ];

  return (
    <>
      <PageHeader title="Earnings," light="what you have earned and what is pending." />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="lg" tone="lilac" label="Total earned" value={inr(e?.total_earned)} loading={earnings.isLoading} sub="All completed jobs" />
        <StatCard size="lg" tone="green" label="Paid to you" value={inr(e?.paid)} loading={earnings.isLoading} sub="Settled by Odeslo" />
        <StatCard size="lg" tone="yellow" label="Pending" value={inr(e?.pending)} loading={earnings.isLoading} sub="Awaiting payout" />
        <StatCard size="lg" tone="blue" label="Completed jobs" value={num(e?.completed_jobs)} loading={earnings.isLoading} sub="Lifetime" />
      </div>
      <div className="mt-[18px]">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(j) => j.id}
          loading={history.isLoading}
          rowHeight={53}
          className="min-h-[420px]"
          empty={<EmptyState title="No completed jobs yet" hint="Payouts appear here once you finish jobs." />}
        />
      </div>
    </>
  );
}
