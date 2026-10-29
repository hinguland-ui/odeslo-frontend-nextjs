"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, CellTitle, DataTable, EmptyState, PageHeader, Panel, type Column } from "@/components/ui";
import { PayoutCard } from "@/components/super-admin/settlement/PayoutCard";
import { buildSettlement, settlementCsv, type SettlementRow } from "@/components/super-admin/settlement/buildSettlement";
import { useLookups } from "@/hooks/useLookups";
import { bookingsApi, dealsApi, jobsApi, partnersApi } from "@/lib/api/deals";
import { refundsApi } from "@/lib/api/money";
import { inr } from "@/lib/utils/format";

const STATUS = {
  to_approve: { tone: "yellow", label: "To approve" },
  paid: { tone: "green", label: "Paid" },
  jobs_pending: { tone: "gray", label: "Jobs pending" },
} as const;

export default function SettlementPage() {
  const look = useLookups();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const deals = useQuery({ queryKey: ["deals", "all"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const jobs = useQuery({ queryKey: ["jobs", "payouts"], queryFn: () => jobsApi.list({ assigned_to_type: "partner" }) });
  const bookings = useQuery({ queryKey: ["bookings", "all"], queryFn: () => bookingsApi.list() });
  const refunds = useQuery({ queryKey: ["refunds", "all"], queryFn: () => refundsApi.list() });
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersApi.list() });

  const rows = buildSettlement(deals.data?.items ?? [], jobs.data?.items ?? [], bookings.data?.items ?? [], refunds.data?.items ?? []);
  const vendorName = (id?: number | null) => {
    const p = partners.data?.items.find((x) => x.id === id);
    return p?.business_name ?? p?.name ?? "—";
  };
  const selected = rows.find((r) => r.deal.id === selectedId) ?? rows[0];
  const toApprove = rows.filter((r) => r.status === "to_approve").length;
  const loading = deals.isLoading || jobs.isLoading || bookings.isLoading;

  const exportCsv = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([settlementCsv(rows, look.society)], { type: "text/csv" }));
    a.download = `settlement-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
  };

  const columns: Column<SettlementRow>[] = [
    { key: "d", header: "Deal", width: "1.5fr", render: (r) => <CellTitle title={r.deal.title} sub={r.societyName ?? look.society(r.deal.society_id)} /> },
    { key: "v", header: "Vendor", width: "1fr", render: (r) => <span className="text-body">{vendorName(r.deal.partner_id ?? r.jobs[0]?.assigned_to_id)}</span> },
    { key: "c", header: "Collected", width: "0.8fr", render: (r) => inr(r.collected) },
    { key: "r", header: "Refunds", width: "0.7fr", render: (r) => <span className="text-pink-fg">{r.refunds ? inr(r.refunds) : "—"}</span> },
    { key: "m", header: "Commission", width: "0.8fr", render: (r) => <span className="text-lilac-fg">{inr(r.commission)}</span> },
    { key: "p", header: "Payout", width: "0.8fr", render: (r) => <span className="font-bold">{inr(r.payout)}</span> },
    { key: "s", header: "Status", width: "0.9fr", render: (r) => <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge> },
  ];

  return (
    <>
      <PageHeader
        title="Vendor settlement,"
        light={`${toApprove} payout${toApprove === 1 ? "" : "s"} to approve.`}
        actions={<Button variant="light" onClick={exportCsv} disabled={!rows.length}>Export report</Button>}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.deal.id}
          loading={loading}
          rowHeight={55}
          onRowClick={(r) => setSelectedId(r.deal.id)}
          selectedKey={selected?.deal.id}
          className="min-h-[712px]"
          empty={<EmptyState title="No vendor jobs yet" hint="Deals appear here once jobs are assigned to a service partner." />}
        />
        {selected ? (
          <PayoutCard key={selected.deal.id} row={selected} society={selected.societyName ?? look.society(selected.deal.society_id)} vendor={vendorName(selected.deal.partner_id ?? selected.jobs[0]?.assigned_to_id)} />
        ) : (
          <Panel variant="soft"><EmptyState title="Nothing to settle" /></Panel>
        )}
      </div>
    </>
  );
}
