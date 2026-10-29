"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, CellTitle, ChipGroup, DataTable, EmptyState, Note, PageHeader, Progress, Segmented, StatCard, StatusBadge, type Column } from "@/components/ui";
import { ApplyDealModal } from "@/components/vendor/deals/ApplyDealModal";
import { useAction } from "@/hooks/useAction";
import { vendorApi } from "@/lib/api/vendor";
import type { Deal } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { fullDate, inr } from "@/lib/utils/format";

type Tab = "open" | "mine";
type Filter = "all" | "open" | "done";
const OPEN = ["published", "full", "closed"];

const expected = (d: Deal) => (d.partner_payout_per_unit ?? 0) * d.confirmed_units;

export default function VendorDealsPage() {
  const [tab, setTab] = useState<Tab>("open");
  const [filter, setFilter] = useState<Filter>("all");
  const [applying, setApplying] = useState<Deal | null>(null);

  const deals = useQuery({ queryKey: ["vendor", "deals"], queryFn: () => vendorApi.deals() });
  const opps = useQuery({ queryKey: ["vendor", "opportunities"], queryFn: vendorApi.opportunities });
  const apps = useQuery({ queryKey: ["vendor", "applications"], queryFn: vendorApi.applications });

  const refresh = [["vendor", "opportunities"], ["vendor", "applications"]];
  const apply = useAction((a: { id: number; quote?: number; message: string }) => vendorApi.apply(a.id, a.quote, a.message), {
    invalidate: refresh,
    success: "Application sent. The society admin will review it.",
    onSuccess: () => setApplying(null),
  });
  const withdraw = useAction((id: number) => vendorApi.withdraw(id), { invalidate: refresh, success: "Application withdrawn" });

  const all = deals.data ?? [];
  const appOf = (dealId: number) => apps.data?.find((a) => a.deal_id === dealId);
  const mine = all.filter((d) => (filter === "open" ? OPEN.includes(d.status) : filter === "done" ? d.status === "completed" : true));
  const upcoming = all.filter((d) => OPEN.includes(d.status));

  const base: Column<Deal>[] = [
    { key: "d", header: "Deal", width: "1.7fr", render: (d) => <CellTitle title={d.title} sub={categoryOf(d.category).label} /> },
    { key: "s", header: "Service date", width: "1fr", render: (d) => fullDate(d.service_date) },
    {
      key: "u", header: "Units booked", width: "1.1fr",
      render: (d) => (
        <div>
          <p className="text-[12px] font-semibold text-ink">{d.confirmed_units} / {d.max_units}</p>
          <Progress className="mt-1 w-[96px]" value={d.confirmed_units} max={d.max_units} />
        </div>
      ),
    },
  ];

  const openColumns: Column<Deal>[] = [
    ...base,
    { key: "pr", header: "Resident price", width: "0.8fr", render: (d) => inr(d.price_per_unit) },
    {
      key: "a", header: "Your application", width: "1.4fr",
      render: (d) => {
        const a = appOf(d.id);
        if (a && (a.status === "applied" || a.status === "accepted")) {
          return (
            <div className="flex items-center gap-2">
              <Badge tone="yellow">Applied{a.quote_per_unit != null ? ` · ${inr(a.quote_per_unit)}/unit` : ""}</Badge>
              <button className="text-[11px] font-semibold text-pink-fg hover:underline" onClick={(e) => { e.stopPropagation(); withdraw.mutate(d.id); }}>Withdraw</button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            {a?.status === "rejected" && <Badge tone="pink" size="sm">Not selected</Badge>}
            <Button size="sm" onClick={() => setApplying(d)}>{a ? "Apply again" : "Apply"}</Button>
          </div>
        );
      },
    },
  ];

  const mineColumns: Column<Deal>[] = [
    ...base,
    { key: "p", header: "Payout / unit", width: "0.9fr", render: (d) => (d.partner_payout_per_unit != null ? inr(d.partner_payout_per_unit) : "—") },
    { key: "e", header: "Expected", width: "0.9fr", render: (d) => <span className="font-semibold">{d.partner_payout_per_unit != null ? inr(expected(d)) : "—"}</span> },
    { key: "st", header: "Status", width: "0.9fr", render: (d) => <StatusBadge status={d.status} /> },
  ];

  const openCount = opps.data?.length ?? 0;

  return (
    <>
      <PageHeader
        title="Deals,"
        light={tab === "open" ? `${openCount} open for you.` : `${all.length} awarded to you.`}
        subtitle="Apply to deals in your societies. The society admin picks the vendor."
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "open", label: `Open for you${openCount ? ` · ${openCount}` : ""}` },
              { value: "mine", label: `My deals${all.length ? ` · ${all.length}` : ""}` },
            ]}
          />
        }
      />

      {tab === "open" ? (
        <>
          <DataTable
            columns={openColumns}
            rows={opps.data}
            rowKey={(d) => d.id}
            loading={opps.isLoading}
            rowHeight={58}
            className="min-h-[360px]"
            empty={<EmptyState title="No open deals right now" hint="Deals appear here when they match your services and a society you are assigned to." />}
          />
          <Note tone="yellow" className="mt-4">
            Apply with the payout per unit you want. If the society picks you, the deal moves to <strong>My deals</strong> and its jobs appear under My jobs.
          </Note>
        </>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
            <StatCard size="md" tone="blue" label="Open deals" value={upcoming.length} loading={deals.isLoading} sub="Booking or service pending" />
            <StatCard size="md" tone="lilac" label="Units booked" value={upcoming.reduce((s, d) => s + d.confirmed_units, 0)} loading={deals.isLoading} sub="Across open deals" />
            <StatCard size="md" tone="green" label="Expected payout" value={inr(upcoming.reduce((s, d) => s + expected(d), 0))} loading={deals.isLoading} sub="Open deals, confirmed units" />
          </div>
          <ChipGroup
            className="mb-4"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "done", label: "Completed" },
            ]}
          />
          <DataTable
            columns={mineColumns}
            rows={mine}
            rowKey={(d) => d.id}
            loading={deals.isLoading}
            rowHeight={58}
            className="min-h-[360px]"
            empty={<EmptyState title="No deals awarded yet" hint="Apply to an open deal and wait for the society to award it to you." action={<Button size="sm" variant="light" onClick={() => setTab("open")}>See open deals</Button>} />}
          />
          <Note tone="lilac" className="mt-4">Jobs for each booking are created and assigned by the society admin. You will see them under My jobs.</Note>
        </>
      )}

      <ApplyDealModal
        key={applying?.id ?? "none"}
        deal={applying}
        loading={apply.isPending}
        onClose={() => setApplying(null)}
        onConfirm={(quote, message) => applying && apply.mutate({ id: applying.id, quote, message })}
      />
    </>
  );
}
