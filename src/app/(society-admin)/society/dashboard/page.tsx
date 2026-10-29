"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Note, PageHeader, Panel } from "@/components/ui";
import { DashboardStats } from "@/components/society-admin/dashboard/DashboardStats";
import { OpenComplaintsCard } from "@/components/society-admin/dashboard/OpenComplaintsCard";
import { PendingApprovalsCard } from "@/components/society-admin/dashboard/PendingApprovalsCard";
import { DealsTable } from "@/components/society-admin/deals/DealsTable";
import { useMe, useMySociety } from "@/hooks/useMe";
import { dashboardApi } from "@/lib/api/dashboard";
import { dealsApi } from "@/lib/api/deals";
import { complaintsApi } from "@/lib/api/ops";
import { residentsApi } from "@/lib/api/residents";
import { dayMonth, greeting, longToday, titleCase } from "@/lib/utils/format";

export default function SocietyDashboardPage() {
  const me = useMe();
  const society = useMySociety();
  const dash = useQuery({ queryKey: ["dashboard", "society"], queryFn: dashboardApi.society });
  const deals = useQuery({ queryKey: ["deals", "live"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const pending = useQuery({ queryKey: ["residents", "pending"], queryFn: residentsApi.pending });
  const complaints = useQuery({ queryKey: ["complaints", "open"], queryFn: () => complaintsApi.list({ open_only: true }) });

  const live = deals.data?.items.filter((d) => d.status === "published" || d.status === "full") ?? [];
  const closingSoon = live
    .filter((d) => d.status === "published" && d.available_units > 0)
    .sort((a, b) => a.cutoff_date.localeCompare(b.cutoff_date))[0];
  const firstName = me.data?.name.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}.`}
        light={society.data ? `Here is ${society.data.name} today.` : undefined}
        subtitle={`${longToday()} · ${titleCase(me.data?.profile.designation ?? "Admin")}`}
        actions={
          <>
            <Button variant="light" href="/society/announcements">Post notice</Button>
            <Button plus href="/society/deals/new">Launch group deal</Button>
          </>
        }
      />

      <DashboardStats data={dash.data} loading={dash.isLoading} conflicts={pending.data?.items.filter((r) => r.unit_occupied_flag).length ?? 0} />

      <div className="mt-[18px] grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <Panel className="flex min-h-[586px] flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold leading-[21px] text-ink">Live group deals</h2>
            <Link href="/society/deals" className="text-[12px] font-semibold text-lilac-fg hover:underline">All deals</Link>
          </div>
          <div className="flex-1">
            <DealsTable deals={live.slice(0, 7)} loading={deals.isLoading} hrefFor={(d) => `/society/deals/${d.id}`} />
          </div>
          {closingSoon && (
            <Note className="mt-4 rounded-[16px] px-3.5 py-3">
              {closingSoon.title} has {closingSoon.available_units} of {closingSoon.max_units} units left. Booking closes{" "}
              {dayMonth(closingSoon.cutoff_date)}.
            </Note>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <PendingApprovalsCard residents={pending.data?.items} total={pending.data?.total ?? 0} loading={pending.isLoading} />
          <OpenComplaintsCard complaints={complaints.data?.items} loading={complaints.isLoading} />
        </div>
      </div>
    </>
  );
}
