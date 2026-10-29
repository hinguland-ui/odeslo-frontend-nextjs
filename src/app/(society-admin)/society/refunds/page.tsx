"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CellTitle, Chip, DataTable, EmptyState, PageHeader, Panel, StatCard, StatusBadge, type Column } from "@/components/ui";
import { RefundAside } from "@/components/society-admin/refunds/RefundAside";
import { bookingsApi } from "@/lib/api/deals";
import { refundsApi } from "@/lib/api/money";
import { residentsApi } from "@/lib/api/residents";
import type { Refund } from "@/lib/types/money";
import { inr, unitLabel } from "@/lib/utils/format";

type Tab = "all" | "requested" | "processing" | "completed";
const IN: Record<Tab, string[]> = { all: [], requested: ["requested"], processing: ["approved", "processed"], completed: ["completed"] };

export default function SocietyRefundsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const refunds = useQuery({ queryKey: ["refunds", "all"], queryFn: () => refundsApi.list() });
  const residents = useQuery({ queryKey: ["residents", "active"], queryFn: () => residentsApi.list({ status: "active" }) });
  const bookings = useQuery({ queryKey: ["bookings", "society"], queryFn: () => bookingsApi.list() });

  const all = refunds.data?.items ?? [];
  const resMap = new Map(residents.data?.items.map((r) => [r.id, r]));
  const dealOf = new Map(bookings.data?.items.map((b) => [b.id, b.deal_title ?? "Group deal"]));
  const rows = tab === "all" ? all : all.filter((r) => IN[tab].includes(r.status));
  const selected = rows.find((r) => r.id === selectedId) ?? rows.find((r) => r.status === "requested") ?? rows[0];
  const sum = (s: string[]) => all.filter((r) => s.includes(r.status));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const doneMonth = all.filter((r) => r.completed_at && r.completed_at >= monthStart);

  const who = (r: Refund) => {
    const res = r.resident_id ? resMap.get(r.resident_id) : undefined;
    return { name: res?.name ?? (r.resident_id ? `Resident #${r.resident_id}` : "—"), unit: res ? unitLabel(res.wing_name, res.unit_no) : "" };
  };
  const what = (r: Refund) => (r.booking_id ? dealOf.get(r.booking_id) ?? `Booking #${r.booking_id}` : "Maintenance payment");

  const columns: Column<Refund>[] = [
    { key: "n", header: "Refund", width: "0.8fr", render: (r) => <span className="font-bold">{r.refund_no}</span> },
    { key: "r", header: "Resident", width: "1fr", render: (r) => <CellTitle title={who(r).name} sub={who(r).unit} /> },
    { key: "w", header: "Reason", width: "1.3fr", render: (r) => <CellTitle title={<span className="font-medium">{r.reason ?? "—"}</span>} sub={what(r)} /> },
    { key: "a", header: "Amount", width: "0.7fr", render: (r) => <span className="font-bold">{inr(r.amount)}</span> },
    { key: "s", header: "Status", width: "0.9fr", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "x", header: "Action", width: "0.7fr",
      render: (r) => (
        <span className={`inline-flex h-[27px] items-center rounded-[13.5px] px-3 text-[12px] font-semibold ${r.status === "requested" ? "bg-ink text-white" : "bg-mist text-ink"}`}>
          {r.status === "requested" ? "Review" : r.status === "completed" || r.status === "rejected" ? "View" : "Track"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Refunds,"
        light={`${sum(["requested"]).length} need your approval.`}
        actions={(["all", "requested", "processing", "completed"] as Tab[]).map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t[0]!.toUpperCase() + t.slice(1)} · {t === "all" ? all.length : sum(IN[t]).length}
          </Chip>
        ))}
      />
      <div className="mb-3.5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="yellow" label="Waiting approval" value={inr(sum(["requested"]).reduce((s, r) => s + r.amount, 0))} sub={`${sum(["requested"]).length} requests`} loading={refunds.isLoading} />
        <StatCard tone="lilac" label="Processing" value={inr(sum(["approved", "processed"]).reduce((s, r) => s + r.amount, 0))} sub="gateway · 3–5 days" loading={refunds.isLoading} />
        <StatCard tone="green" label="Refunded this month" value={inr(doneMonth.reduce((s, r) => s + r.amount, 0))} sub={`${doneMonth.length} completed`} loading={refunds.isLoading} />
        <StatCard tone="blue" label="Rejected" value={sum(["rejected"]).length} sub="with a reason sent" loading={refunds.isLoading} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={refunds.isLoading} onRowClick={(r) => setSelectedId(r.id)}
          selectedKey={selected?.id} className="min-h-[611px]" empty={<EmptyState title="No refunds" hint="Refunds are raised when a paid booking is cancelled." />} />
        {selected ? <RefundAside key={selected.id + selected.status} refund={selected} who={`${who(selected).name}${who(selected).unit ? ` · ${who(selected).unit}` : ""}`} what={what(selected)} />
          : <Panel variant="soft"><EmptyState title="Nothing selected" /></Panel>}
      </div>
    </>
  );
}
