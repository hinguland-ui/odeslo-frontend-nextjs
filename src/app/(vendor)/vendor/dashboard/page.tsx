"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, CellTitle, EmptyState, Note, PageHeader, Panel, PanelTitle, StatCard, StatusBadge } from "@/components/ui";
import { useMe } from "@/hooks/useMe";
import { vendorApi } from "@/lib/api/vendor";
import { dayMonth, greeting, inr, longToday, time } from "@/lib/utils/format";

export default function VendorDashboardPage() {
  const me = useMe();
  const profile = useQuery({ queryKey: ["vendor", "profile"], queryFn: vendorApi.profile });
  const today = useQuery({ queryKey: ["vendor", "jobs", "today"], queryFn: () => vendorApi.jobs("today"), refetchInterval: 60_000 });
  const active = useQuery({ queryKey: ["vendor", "jobs", "active"], queryFn: () => vendorApi.jobs("active"), refetchInterval: 60_000 });
  const earnings = useQuery({ queryKey: ["vendor", "earnings"], queryFn: vendorApi.earnings });

  const firstName = me.data?.name.split(" ")[0] ?? "";
  const newJobs = (active.data ?? []).filter((j) => j.status === "assigned" || j.status === "rescheduled");
  const p = profile.data;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}.`}
        light="Here is your work today."
        subtitle={longToday()}
        actions={<Button href="/vendor/jobs">Open my jobs</Button>}
      />

      {p && !p.verified && (
        <Note tone="yellow" className="mb-4">Your account is waiting for verification by the Odeslo team. You will receive jobs once it is verified.</Note>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard size="lg" tone="blue" label="Today's jobs" value={today.data?.length ?? 0} loading={today.isLoading} sub="Scheduled for today" href="/vendor/jobs" />
        <StatCard size="lg" tone="yellow" label="Waiting for you" value={newJobs.length} loading={active.isLoading} sub="New jobs to accept" href="/vendor/jobs" />
        <StatCard size="lg" tone="lilac" label="Active jobs" value={active.data?.length ?? 0} loading={active.isLoading} sub="Not completed yet" href="/vendor/jobs" />
        <StatCard size="lg" tone="green" label="Pending payout" value={inr(earnings.data?.pending)} loading={earnings.isLoading} sub={`${inr(earnings.data?.paid)} paid`} href="/vendor/earnings" />
        <StatCard
          size="lg"
          tone="peach"
          label="Rating"
          value={p?.rating_count ? `★ ${p.rating_avg.toFixed(1)}` : "—"}
          loading={profile.isLoading}
          sub={p ? `${p.rating_count} reviews` : undefined}
        />
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <Panel className="min-h-[360px]">
          <PanelTitle aside={<Link href="/vendor/jobs" className="font-semibold text-lilac-fg hover:underline">All jobs</Link>}>Today&apos;s schedule</PanelTitle>
          {today.data?.length ? (
            <ul className="divide-y divide-mist">
              {today.data.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-3 py-3">
                  <CellTitle title={j.title} sub={`${j.job_no}${j.slot ? ` · ${j.slot}` : ""}`} />
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[12px] font-semibold text-body">{time(j.scheduled_at)}</span>
                    <StatusBadge status={j.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing scheduled today" hint="Enjoy the break, or check upcoming jobs." action={<Button size="sm" variant="light" href="/vendor/jobs">View jobs</Button>} />
          )}
        </Panel>

        <Panel variant="soft" className="min-h-[360px]">
          <PanelTitle>Needs your action</PanelTitle>
          {newJobs.length ? (
            <ul className="space-y-2">
              {newJobs.map((j) => (
                <li key={j.id}>
                  <Link href="/vendor/jobs" className="flex items-center justify-between gap-3 rounded-[16px] bg-white px-3.5 py-3 hover:ring-1 hover:ring-black/5">
                    <CellTitle title={j.title} sub={j.scheduled_at ? `${dayMonth(j.scheduled_at)} · ${time(j.scheduled_at)}` : j.job_no} />
                    <StatusBadge status={j.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="All caught up" hint="New assignments will show up here." />
          )}
        </Panel>
      </div>
    </>
  );
}
