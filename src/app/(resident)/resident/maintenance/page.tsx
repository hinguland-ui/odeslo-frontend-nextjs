"use client";

import { FullScreenLoader } from "@/components/ui/Preloader";
import { useQuery } from "@tanstack/react-query";
import { Button, CellTitle, DataTable, EmptyState, Note, PageHeader, StatCard, StatusBadge, type Column } from "@/components/ui";
import { usePay } from "@/hooks/usePay";
import { residentApi } from "@/lib/api/resident";
import type { Bill, PaymentRow } from "@/lib/types/portal";
import { dayMonth, fullDate, inr } from "@/lib/utils/format";
import { statusLabel } from "@/lib/utils/status";

export default function ResidentMaintenancePage() {
  const m = useQuery({ queryKey: ["resident", "maintenance"], queryFn: residentApi.maintenance });
  const payments = useQuery({ queryKey: ["resident", "payments"], queryFn: residentApi.payments });
  const pay = usePay();

  const unpaid = m.data?.unpaid_bills ?? [];
  const forbidden = m.error instanceof Error ? m.error.message : null;

  const billColumns = (withPay: boolean): Column<Bill>[] => [
    { key: "b", header: "Bill", width: "1.2fr", render: (b) => <CellTitle title={b.period} sub={b.bill_no} /> },
    { key: "d", header: "Due date", width: "0.9fr", render: (b) => fullDate(b.due_date) },
    { key: "a", header: "Amount", width: "0.8fr", render: (b) => inr(b.total_amount) },
    { key: "o", header: withPay ? "Outstanding" : "Paid", width: "0.8fr", render: (b) => <span className="font-semibold">{inr(withPay ? b.outstanding : b.paid_amount)}</span> },
    { key: "s", header: "Status", width: "0.8fr", render: (b) => <StatusBadge status={b.status} /> },
    ...(withPay
      ? [{ key: "p", header: "", width: "110px", render: (b: Bill) => <Button size="sm" loading={pay.isPending && pay.variables?.refId === b.id} onClick={() => pay.mutate({ refType: "maintenance", refId: b.id })}>Pay now</Button> }]
      : []),
  ];

  const payColumns: Column<PaymentRow>[] = [
    { key: "t", header: "Transaction", width: "1.4fr", render: (p) => <CellTitle title={p.txn_id} sub={fullDate(p.created_at)} /> },
    { key: "r", header: "For", width: "0.8fr", render: (p) => statusLabel(p.ref_type) },
    { key: "m", header: "Mode", width: "0.8fr", render: (p) => statusLabel(p.mode) },
    { key: "a", header: "Amount", width: "0.8fr", render: (p) => <span className="font-semibold">{inr(p.amount)}</span> },
    { key: "s", header: "Status", width: "0.8fr", render: (p) => <StatusBadge status={p.status} /> },
  ];

  if (forbidden && !m.data)
    return (
      <>
        <PageHeader title="Maintenance," light="bills and payments." />
        <Note tone="yellow">{forbidden}</Note>
      </>
    );

  return (
    <>
      {pay.isPending && <FullScreenLoader variant="spin" label="Payment in progress… keep this page open" />}
      <PageHeader title="Maintenance," light={unpaid.length ? `${inr(m.data?.current_due)} due.` : "you are all paid up."} />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard size="lg" tone="yellow" label="Current due" value={inr(m.data?.current_due)} loading={m.isLoading} sub={m.data?.next_due_date ? `Next due ${dayMonth(m.data.next_due_date)}` : "Nothing pending"} />
        <StatCard size="lg" tone="blue" label="Unpaid bills" value={unpaid.length} loading={m.isLoading} sub="Pay each bill online" />
        <StatCard size="lg" tone="green" label="Paid bills" value={m.data?.history.length ?? 0} loading={m.isLoading} sub="In history" />
      </div>

      <h2 className="mb-2 text-[15px] font-bold text-ink">Unpaid bills</h2>
      <DataTable columns={billColumns(true)} rows={unpaid} rowKey={(b) => b.id} loading={m.isLoading} rowHeight={53} className="mb-5" empty={<EmptyState title="No unpaid bills" hint="You are all caught up." />} />

      <h2 className="mb-2 text-[15px] font-bold text-ink">Paid bills</h2>
      <DataTable columns={billColumns(false)} rows={m.data?.history} rowKey={(b) => b.id} loading={m.isLoading} rowHeight={53} className="mb-5" empty={<EmptyState title="No bills in history yet" />} />

      <h2 className="mb-2 text-[15px] font-bold text-ink">Payment history</h2>
      <DataTable columns={payColumns} rows={payments.data?.items} rowKey={(p) => p.id} loading={payments.isLoading} rowHeight={53} empty={<EmptyState title="No payments yet" />} />
    </>
  );
}
