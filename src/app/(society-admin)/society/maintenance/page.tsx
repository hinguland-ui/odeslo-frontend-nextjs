"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, DataTable, EmptyState, PageHeader, Progress, StatCard, StatusBadge, type Column } from "@/components/ui";
import { MaintenanceAside } from "@/components/society-admin/maintenance/MaintenanceAside";
import { OfflinePaymentModal } from "@/components/society-admin/maintenance/OfflinePaymentModal";
import { useAction } from "@/hooks/useAction";
import { useMySociety } from "@/hooks/useMe";
import { maintenanceApi, paymentsApi } from "@/lib/api/money";
import type { Bill } from "@/lib/types/money";
import { dayMonth, inr, isoDate, percent, titleCase } from "@/lib/utils/format";

const monthLabel = (d: Date) => d.toLocaleDateString("en-IN", { month: "short" });

export default function MaintenancePage() {
  const society = useMySociety();
  const [offline, setOffline] = useState(false);
  const bills = useQuery({ queryKey: ["bills"], queryFn: () => maintenanceApi.bills() });
  const payments = useQuery({ queryKey: ["payments", "maintenance"], queryFn: () => paymentsApi.list({ ref_type: "maintenance", status: "success" }) });

  const all = bills.data?.items ?? [];
  const periods = [...new Set(all.map((b) => b.period))].sort((a, b) => b.localeCompare(a));
  const [periodSel, setPeriodSel] = useState<string | null>(null);
  const period = periodSel ?? periods[0];
  const summary = useQuery({ queryKey: ["maintenance", "summary", period], queryFn: () => maintenanceApi.summary(period), enabled: !!period });
  const rows = all.filter((b) => b.period === period).sort((a, b) => (a.unit_label ?? "").localeCompare(b.unit_label ?? "", undefined, { numeric: true }));

  const paidVia = new Map<number, string>();
  payments.data?.items.forEach((p) => paidVia.set(p.ref_id, `${p.mode === "upi" ? "UPI" : titleCase(p.mode)} · ${dayMonth(p.paid_at ?? p.created_at)}`));

  const now = new Date();
  const thisMonth = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const hasThisMonth = all.some((b) => b.period_start === thisMonth);
  const target = hasThisMonth ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
  const unpaid = rows.filter((b) => b.outstanding > 0);

  const inv = [["bills"], ["maintenance"], ["dashboard"]];
  const generate = useAction(() => maintenanceApi.generate({ period_start: isoDate(target), notify_residents: true }), {
    success: (r) => `${r.created} bills generated for ${r.period}`, invalidate: inv, onSuccess: () => setPeriodSel(null),
  });
  const remind = useAction(() => maintenanceApi.remind(unpaid.map((b) => b.id)), { success: (r) => `Reminder sent for ${r.reminded} bills`, invalidate: inv });

  const s = summary.data;
  const billed = s?.billed ?? 0;
  const columns: Column<Bill>[] = [
    { key: "u", header: "Unit", width: "0.7fr", render: (b) => <span className="font-bold">{b.unit_label ?? `#${b.unit_id}`}</span> },
    { key: "n", header: "Bill no.", width: "1.1fr", render: (b) => <span className="font-semibold">{b.bill_no}</span> },
    { key: "a", header: "Bill", width: "0.8fr", render: (b) => inr(b.amount) },
    { key: "l", header: "Late fee", width: "0.7fr", render: (b) => <span className="text-body">{b.late_fee ? inr(b.late_fee) : "—"}</span> },
    { key: "p", header: "Paid via", width: "1fr", render: (b) => <span className="text-body">{paidVia.get(b.id) ?? (b.paid_amount ? inr(b.paid_amount) : "—")}</span> },
    { key: "s", header: "Status", width: "0.9fr", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Maintenance,"
        light={period ? `${period}.` : "no bills yet."}
        actions={
          <>
            <Button variant="light" disabled={!unpaid.length} onClick={() => setOffline(true)}>Mark offline payment</Button>
            <Button variant="light" disabled={!unpaid.length} loading={remind.isPending} onClick={() => remind.mutate(undefined)}>Send reminder · {unpaid.length}</Button>
            <Button loading={generate.isPending} onClick={() => generate.mutate(undefined)}>Generate {monthLabel(target)} bills</Button>
          </>
        }
      />
      <div className="mb-3.5 grid grid-cols-2 gap-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 deep rounded-[22px] bg-ink p-4 text-white xl:col-span-1">
          <p className="text-[12px] leading-[15px] text-night-muted">Collected of {inr(billed)}</p>
          <p className="mt-2 text-[28px] font-bold leading-[35px] tracking-[-0.84px]">{inr(s?.collected ?? 0)} · {percent(s?.collected ?? 0, billed)}%</p>
          <Progress value={s?.collected ?? 0} max={billed || 1} className="mt-2.5 h-2" trackClass="bg-night-line" barClass="bg-mint" />
        </div>
        <StatCard size="lg" tone="green" label="Paid" value={s?.paid_bills ?? 0} sub={`of ${s?.bills ?? 0} bills`} loading={summary.isLoading && !!period} />
        <StatCard size="lg" tone="yellow" label="Due" value={(s?.bills ?? 0) - (s?.paid_bills ?? 0) - (s?.overdue_bills ?? 0)} sub={rows[0] ? `due date ${dayMonth(rows[0].due_date)}` : "—"} loading={summary.isLoading && !!period} />
        <StatCard size="lg" tone="pink" label="Overdue" value={s?.overdue_bills ?? 0} sub={society.data?.maintenance_settings.late_fee_enabled ? `${inr(society.data.maintenance_settings.late_fee)} late fee applied` : "No late fee"} loading={summary.isLoading && !!period} />
      </div>
      {periods.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {periods.slice(0, 8).map((p) => (
            <button key={p} onClick={() => setPeriodSel(p)} className={`h-[29px] rounded-[14.5px] px-3 text-[12px] font-semibold ${p === period ? "bg-ink text-white" : "bg-mist text-ink"}`}>{p}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <DataTable columns={columns} rows={rows} rowKey={(b) => b.id} loading={bills.isLoading} rowHeight={42} className="min-h-[593px]"
          empty={<EmptyState title="No bills yet" hint={`Generate ${monthLabel(target)} bills to start collecting maintenance.`} />} />
        <MaintenanceAside settings={society.data?.maintenance_settings} onOffline={() => unpaid.length && setOffline(true)} />
      </div>
      {offline && <OfflinePaymentModal open onClose={() => setOffline(false)} bills={rows} />}
    </>
  );
}
