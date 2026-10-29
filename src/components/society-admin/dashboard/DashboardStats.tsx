"use client";

import { StatCard } from "@/components/ui";
import type { SocietyDashboard } from "@/lib/api/dashboard";
import { inrShort } from "@/lib/utils/format";

export function DashboardStats({ data, loading, conflicts }: { data?: SocietyDashboard; loading: boolean; conflicts: number }) {
  const m = data?.maintenance;
  const billed = m ? m.collected + m.pending : 0;
  return (
    <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
      <StatCard size="lg" tone="blue" href="/society/residents" label="Residents" loading={loading}
        value={data?.residents.count ?? 0} sub="Tap to open list" />
      <StatCard size="lg" tone="lilac" href="/society/approvals" label="Pending approvals" loading={loading}
        value={data?.pending_approvals.count ?? 0}
        sub={conflicts ? `${conflicts} unit conflict${conflicts > 1 ? "s" : ""}` : "No conflicts"} />
      <StatCard size="lg" tone="green" href="/society/deals" label="Active bookings" loading={loading}
        value={data?.active_bookings.count ?? 0} sub="Cancelled not counted" />
      <StatCard size="lg" tone="yellow" href="/society/maintenance" label="Maintenance" loading={loading}
        value={inrShort(m?.collected ?? 0)} sub={`of ${inrShort(billed)} · ${m?.overdue_bills ?? 0} overdue`} />
      <StatCard size="lg" tone="pink" href="/society/complaints" label="Open complaints" loading={loading}
        value={data?.open_complaints ?? 0} sub={`${data?.open_requests ?? 0} open requests`} />
      <StatCard size="lg" tone="peach" href="/society/service-jobs" label="Jobs today" loading={loading}
        value={data?.todays_service_jobs ?? 0} sub={`${data?.pending_refunds ?? 0} refunds pending`} />
    </div>
  );
}
