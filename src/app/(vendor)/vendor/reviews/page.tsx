"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, PageHeader, Panel, Skeleton, StatCard } from "@/components/ui";
import { vendorApi } from "@/lib/api/vendor";
import { fullDate } from "@/lib/utils/format";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

export default function VendorReviewsPage() {
  const profile = useQuery({ queryKey: ["vendor", "profile"], queryFn: vendorApi.profile });
  const history = useQuery({ queryKey: ["vendor", "jobs", "history"], queryFn: () => vendorApi.jobs("history") });

  const rated = (history.data ?? []).filter((j) => j.rating != null);
  const p = profile.data;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: rated.filter((j) => j.rating === s).length }));

  return (
    <>
      <PageHeader title="Reviews," light="what residents say about your work." />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="lg" tone="peach" label="Average rating" value={p?.rating_count ? `★ ${p.rating_avg.toFixed(1)}` : "—"} loading={profile.isLoading} sub={`${p?.rating_count ?? 0} ratings`} />
        <StatCard size="lg" tone="green" label="5-star jobs" value={dist[0]!.n} loading={history.isLoading} sub="Recent history" />
        <StatCard size="lg" tone="yellow" label="Low ratings" value={dist[3]!.n + dist[4]!.n} loading={history.isLoading} sub="1–2 stars" />
        <StatCard size="lg" tone="blue" label="With feedback" value={rated.filter((j) => j.feedback).length} loading={history.isLoading} sub="Written comments" />
      </div>

      <Panel>
        {history.isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : rated.length === 0 ? (
          <EmptyState title="No reviews yet" hint="Residents can rate a job after it is completed." />
        ) : (
          <ul className="divide-y divide-mist">
            {rated.map((j) => (
              <li key={j.id} className="py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-ink">{j.title}</p>
                  <span className="text-[13px] font-bold tracking-wider text-yellow-fg">{stars(j.rating!)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted">{j.job_no} · {fullDate(j.completed_at)}</p>
                {j.feedback && <p className="mt-1.5 rounded-[14px] bg-panel px-3 py-2 text-[12px] leading-[16px] text-body">{j.feedback}</p>}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
