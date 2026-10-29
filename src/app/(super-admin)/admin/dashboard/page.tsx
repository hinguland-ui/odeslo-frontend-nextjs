"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, PageHeader, StatCard } from "@/components/ui";
import { NeedsYouCard } from "@/components/super-admin/dashboard/NeedsYouCard";
import { TopSocieties, type SocietyRank } from "@/components/super-admin/dashboard/TopSocieties";
import { WeeklyRevenueChart } from "@/components/super-admin/dashboard/WeeklyRevenueChart";
import { dashboardApi } from "@/lib/api/dashboard";
import { locationRequestsApi } from "@/lib/api/societies";
import { dealsApi, jobsApi } from "@/lib/api/deals";
import { refundsApi } from "@/lib/api/money";
import { societiesApi } from "@/lib/api/societies";
import { inrShort, isoDate, num } from "@/lib/utils/format";

export default function SuperDashboardPage() {
  const now = new Date();
  const monthStart = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const [eightWeeksAgo] = useState(() => isoDate(new Date(Date.now() - 56 * 86_400_000)));
  const monthName = now.toLocaleDateString("en-IN", { month: "long" });

  const dash = useQuery({ queryKey: ["dashboard", "super"], queryFn: dashboardApi.super });
  const weekly = useQuery({ queryKey: ["reports", "revenue", eightWeeksAgo], queryFn: () => dashboardApi.revenueReport({ date_from: eightWeeksAgo }) });
  const month = useQuery({ queryKey: ["reports", "revenue", monthStart], queryFn: () => dashboardApi.revenueReport({ date_from: monthStart }) });
  const bookingsReport = useQuery({ queryKey: ["reports", "bookings"], queryFn: () => dashboardApi.bookingsReport() });
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societiesApi.list() });
  const deals = useQuery({ queryKey: ["deals", "all"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const refunds = useQuery({ queryKey: ["refunds", "requested"], queryFn: () => refundsApi.list({ status: "requested" }) });
  const payouts = useQuery({ queryKey: ["jobs", "payouts"], queryFn: () => jobsApi.list({ assigned_to_type: "partner" }) });

  const locationReqs = useQuery({ queryKey: ["location-requests", "pending"], queryFn: () => locationRequestsApi.list("pending") });
  const d = dash.data;
  const allDeals = deals.data?.items ?? [];
  const live = allDeals.filter((x) => x.status === "published" || x.status === "full");
  const liveSocieties = new Set(live.map((x) => x.society_id ?? "platform")).size;
  const monthGmv = month.data?.filter((r) => r.ref_type === "booking").reduce((s, r) => s + r.amount, 0) ?? 0;

  // Commission = what residents paid minus the vendor payout, on deals that have a payout set.
  const priced = allDeals.filter((x) => x.partner_payout_per_unit != null && x.confirmed_units > 0);
  const dealGmv = priced.reduce((s, x) => s + x.confirmed_units * x.price_per_unit, 0);
  const commission = priced.reduce((s, x) => s + x.confirmed_units * (x.price_per_unit - (x.partner_payout_per_unit ?? 0)), 0);

  const gmvBySociety = new Map<number, number>();
  bookingsReport.data
    ?.filter((r) => r.status !== "cancelled")
    .forEach((r) => gmvBySociety.set(r.society_id, (gmvBySociety.get(r.society_id) ?? 0) + r.amount));
  const ranks: SocietyRank[] = (societies.data?.items ?? [])
    .map((society) => ({
      society,
      gmv: gmvBySociety.get(society.id) ?? 0,
      deals: allDeals.filter((x) => x.society_id === society.id).length,
    }))
    .sort((a, b) => b.gmv - a.gmv || b.deals - a.deals);

  const pendingPayoutDeals = new Set(
    payouts.data?.items.filter((j) => j.status === "completed" && j.payout_status === "pending").map((j) => j.deal_id),
  ).size;

  return (
    <>
      <PageHeader
        title="Odeslo platform,"
        light={`${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.`}
        subtitle="All societies · all cities"
        actions={<Button plus href="/admin/societies/new">Onboard society</Button>}
      />

      <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
        <StatCard tone="blue" href="/admin/societies" label="Societies" loading={dash.isLoading}
          value={d?.societies.total ?? 0} sub={`${d?.societies.active ?? 0} active · ${d?.societies.pending ?? 0} pending`} />
        <StatCard tone="lilac" label="Residents" loading={dash.isLoading}
          value={num(d?.residents ?? 0)} sub={`${d?.pending_residents ?? 0} awaiting approval`} />
        <StatCard tone="green" href="/admin/bookings" label="Live deals" loading={dash.isLoading}
          value={d?.active_deals ?? 0} sub={`across ${liveSocieties} societ${liveSocieties === 1 ? "y" : "ies"}`} />
        <StatCard tone="yellow" href="/admin/payments" label="Deal GMV" loading={month.isLoading}
          value={inrShort(monthGmv)} sub={monthName} />
        <StatCard tone="peach" href="/admin/settlement" label="Commission" loading={deals.isLoading}
          value={inrShort(commission)} sub={dealGmv ? `${((commission / dealGmv) * 100).toFixed(1)}% avg` : "No vendor payouts set"} />
        <StatCard tone="pink" href="/admin/refunds" label="Refunds" loading={dash.isLoading}
          value={inrShort(d?.refunded ?? 0)} sub={`${d?.pending_refunds ?? 0} waiting`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
        <WeeklyRevenueChart rows={weekly.data} loading={weekly.isLoading} />
        <div className="flex flex-col gap-4">
          <NeedsYouCard
            items={[
              { label: "Society onboarding requests", count: d?.societies.pending ?? 0, href: "/admin/societies?status=pending", tone: "blue" },
              { label: "Society location requests", count: locationReqs.data?.length ?? 0, href: "/admin/location-requests", tone: "green" },
              { label: "Refunds over ₹1,000", count: refunds.data?.items.filter((r) => r.amount > 1000).length ?? 0, href: "/admin/refunds", tone: "pink" },
              { label: "Vendor payouts to approve", count: pendingPayoutDeals, href: "/admin/settlement", tone: "yellow" },
            ]}
          />
          <TopSocieties ranks={ranks} loading={societies.isLoading} />
        </div>
      </div>
    </>
  );
}
