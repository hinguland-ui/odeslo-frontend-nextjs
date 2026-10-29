"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChipGroup, DataTable, PageHeader, StatCard, StatusBadge, type Column } from "@/components/ui";
import { useLookups } from "@/hooks/useLookups";
import { dashboardApi } from "@/lib/api/dashboard";
import { bookingsApi, dealsApi } from "@/lib/api/deals";
import type { Booking } from "@/lib/types/deal";
import { daysUntil, inr, num } from "@/lib/utils/format";

type Tab = "active" | "waitlisted" | "completed" | "cancelled";

export default function AllBookingsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const look = useLookups();
  const bookings = useQuery({ queryKey: ["bookings", "all"], queryFn: () => bookingsApi.list() });
  const deals = useQuery({ queryKey: ["deals", "all"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const dash = useQuery({ queryKey: ["dashboard", "super"], queryFn: dashboardApi.super });

  const all = bookings.data?.items ?? [];
  const groups: Record<Tab, Booking[]> = {
    active: all.filter((b) => b.status === "confirmed" || b.status === "pending_payment"),
    waitlisted: all.filter((b) => b.status === "waitlisted"),
    completed: all.filter((b) => b.status === "completed"),
    cancelled: all.filter((b) => b.status === "cancelled"),
  };
  const live = (deals.data?.items ?? []).filter((d) => d.status === "published");
  const nearCutoff = live.filter((d) => d.available_units > 0 && daysUntil(d.cutoff_date) <= 2).length;
  const unitsConfirmed = all.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + b.units_count, 0);
  const fillRate = live.length ? Math.round((live.reduce((s, d) => s + (d.max_units - d.available_units) / d.max_units, 0) / live.length) * 100) : 0;

  const columns: Column<Booking>[] = [
    { key: "no", header: "Booking", width: "0.8fr", render: (b) => <span className="font-semibold text-body">{b.booking_no}</span> },
    { key: "deal", header: "Deal", width: "1.3fr", render: (b) => <span className="truncate font-semibold text-ink">{b.deal_title ?? `Deal #${b.deal_id}`}</span> },
    { key: "soc", header: "Society", width: "1.1fr", render: (b) => <span className="text-body">{look.society(b.society_id)}</span> },
    { key: "res", header: "Resident", width: "1fr", render: (b) => <span>{look.residentName(b.resident_id).split(" ")[0]} · {look.residentUnit(b.resident_id)}</span> },
    { key: "units", header: "Units", width: "0.5fr", render: (b) => b.units_count },
    {
      key: "paid", header: "Paid", width: "0.8fr",
      render: (b) => (
        <span className="font-bold">
          {b.payment_status === "paid" ? inr(b.amount) : b.payment_status === "refunded" ? `${inr(b.amount)} refunded` : "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", width: "0.8fr", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="All bookings,"
        light="every society."
        actions={
          <ChipGroup
            value={tab}
            onChange={setTab}
            options={[
              { value: "active", label: `Active · ${num(groups.active.length)}` },
              { value: "waitlisted", label: `Waitlisted · ${num(groups.waitlisted.length)}` },
              { value: "completed", label: `Completed · ${num(groups.completed.length)}` },
              { value: "cancelled", label: `Cancelled · ${num(groups.cancelled.length)}` },
            ]}
          />
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="sm" tone="blue" label="Live deals" value={dash.data?.active_deals ?? 0} loading={dash.isLoading} />
        <StatCard size="sm" tone="green" label="Units confirmed" value={num(unitsConfirmed)} loading={bookings.isLoading} />
        <StatCard size="sm" tone="yellow" label="Near cut-off" value={`${nearCutoff} deal${nearCutoff === 1 ? "" : "s"}`} loading={deals.isLoading} />
        <StatCard size="sm" tone="lilac" label="Avg fill of live deals" value={`${fillRate}%`} loading={deals.isLoading} />
      </div>
      <DataTable
        columns={columns}
        rows={groups[tab]}
        rowKey={(b) => b.id}
        loading={bookings.isLoading}
        rowHeight={42}
        rowClassName={(b) => (b.status === "cancelled" ? "opacity-55" : undefined)}
        className="min-h-[560px]"
      />
    </>
  );
}
