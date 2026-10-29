"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Chip, CellTitle, DataTable, PageHeader, StatCard, StatusBadge, type Column } from "@/components/ui";
import { PaymentDetailModal } from "@/components/super-admin/payments/PaymentDetailModal";
import { useToast } from "@/components/providers/ToastProvider";
import { useLookups } from "@/hooks/useLookups";
import { bookingsApi } from "@/lib/api/deals";
import { paymentsApi } from "@/lib/api/money";
import type { Payment } from "@/lib/types/money";
import { inr, inrShort, isoDate, num, percent, relativeDay, titleCase } from "@/lib/utils/format";

type Filter = "month" | "booking" | "maintenance" | "failed";

export default function PaymentsPage() {
  const [filter, setFilter] = useState<Filter>("month");
  const [openId, setOpenId] = useState<number | null>(null);
  const toast = useToast();
  const look = useLookups();
  const now = new Date();
  const monthStart = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthName = now.toLocaleDateString("en-IN", { month: "long" });

  const payments = useQuery({ queryKey: ["payments", "all"], queryFn: () => paymentsApi.list() });
  const bookings = useQuery({ queryKey: ["bookings", "all"], queryFn: () => bookingsApi.list() });
  const dealTitle = new Map(bookings.data?.items.map((b) => [b.id, `${b.deal_title ?? "Deal"} · ${b.units_count} unit${b.units_count > 1 ? "s" : ""}`]));

  const all = payments.data?.items ?? [];
  const ok = all.filter((p) => p.status === "success");
  const total = ok.reduce((s, p) => s + p.amount, 0);
  const maint = ok.filter((p) => p.ref_type === "maintenance").reduce((s, p) => s + p.amount, 0);
  const deals = ok.filter((p) => p.ref_type === "booking").reduce((s, p) => s + p.amount, 0);
  const failed = all.filter((p) => p.status === "failed");
  const pending = all.filter((p) => p.status === "pending" || p.status === "initiated");

  const rows = all.filter((p) =>
    filter === "month" ? p.created_at.slice(0, 10) >= monthStart
    : filter === "failed" ? p.status === "failed"
    : p.ref_type === filter,
  );

  const exportCsv = async () => {
    try {
      await paymentsApi.exportCsv(filter === "failed" ? { status: "failed" } : filter === "month" ? { date_from: monthStart } : { ref_type: filter });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Export failed", "error");
    }
  };

  const columns: Column<Payment>[] = [
    { key: "txn", header: "Txn ID", width: "0.9fr", render: (p) => <span className="font-semibold text-body">{p.txn_id}</span> },
    { key: "res", header: "Resident", width: "1fr", render: (p) => <CellTitle title={look.residentName(p.resident_id)} sub={relativeDay(p.paid_at ?? p.created_at)} /> },
    {
      key: "for", header: "For", width: "1fr",
      render: (p) => (p.ref_type === "booking" ? dealTitle.get(p.ref_id) ?? `Booking #${p.ref_id}` : `Maintenance bill #${p.ref_id}`),
    },
    { key: "soc", header: "Society", width: "0.95fr", render: (p) => <span className="text-body">{look.society(p.society_id)}</span> },
    { key: "mode", header: "Mode", width: "0.65fr", render: (p) => <span className="text-body">{p.mode === "upi" ? "UPI" : titleCase(p.mode)}</span> },
    { key: "amt", header: "Amount", width: "0.65fr", render: (p) => <span className="font-bold">{inr(p.amount)}</span> },
    { key: "status", header: "Status", width: "0.7fr", render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Payments,"
        light="all transactions."
        actions={
          <>
            <Chip active={filter === "month"} onClick={() => setFilter("month")}>{monthName}</Chip>
            <Chip active={filter === "booking"} onClick={() => setFilter("booking")}>Deals</Chip>
            <Chip active={filter === "maintenance"} onClick={() => setFilter("maintenance")}>Maintenance</Chip>
            <Chip active={filter === "failed"} tone="pink" onClick={() => setFilter("failed")}>Failed · {failed.length}</Chip>
            <Chip onClick={exportCsv}>Export</Chip>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="green" label="Successful" value={inrShort(total)} sub={`${num(ok.length)} transactions`} loading={payments.isLoading} />
        <StatCard tone="blue" label="Maintenance" value={inrShort(maint)} sub={`${percent(maint, total)}% of total`} loading={payments.isLoading} />
        <StatCard tone="lilac" label="Group deals" value={inrShort(deals)} sub={`${percent(deals, total)}% of total`} loading={payments.isLoading} />
        <StatCard tone="pink" label="Failed / pending" value={`${failed.length} / ${pending.length}`} sub="needs follow-up" loading={payments.isLoading} />
      </div>
      <DataTable columns={columns} rows={rows} rowKey={(p) => p.id} loading={payments.isLoading} onRowClick={(p) => setOpenId(p.id)} className="min-h-[540px]" />
      <PaymentDetailModal paymentId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
