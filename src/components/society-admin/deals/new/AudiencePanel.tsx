"use client";

import { useQuery } from "@tanstack/react-query";
import { Eyebrow, Panel } from "@/components/ui";
import { dashboardApi } from "@/lib/api/dashboard";
import { partnersApi } from "@/lib/api/deals";
import { categoryOf } from "@/lib/utils/categories";

/** Right column: vendors and residents who will see the deal. */
export function AudiencePanel({ category, city }: { category: string; city?: string }) {
  const vendors = useQuery({ queryKey: ["partners", "available", category], queryFn: () => partnersApi.available(category) });
  const dash = useQuery({ queryKey: ["dashboard", "society"], queryFn: dashboardApi.society });
  const label = categoryOf(category).label;
  const best = vendors.data?.slice().sort((a, b) => b.rating_avg - a.rating_avg)[0];

  return (
    <div className="space-y-2.5">
      <Eyebrow className="text-muted">Who will see it</Eyebrow>
      <Panel variant="dark" className="!p-4">
        <Eyebrow className="!text-[10px] text-violet-soft">Vendors · {label}{city ? ` · ${city}` : ""}</Eyebrow>
        <p className="mt-2 text-[28px] font-bold leading-[35px]">{vendors.data?.length ?? "…"} eligible</p>
        <p className="mt-1.5 text-[12px] leading-[15px] text-night-muted">Verified vendors serving your society for {label}. You award one after bookings close.</p>
        {best && <p className="mt-2 text-[12px] leading-[15px] text-night-muted">Top rated: {best.business_name ?? best.name}{best.rating_count ? ` · ★ ${best.rating_avg.toFixed(1)}` : ""}</p>}
      </Panel>
      <Panel variant="tone" tone="blue" className="!p-4">
        <p className="text-[13px] font-bold leading-4 text-ink">Residents</p>
        <p className="mt-1.5 text-[12px] leading-[15px] text-body">{dash.data?.residents.count ?? "…"} approved residents get a push notification and can book from the app.</p>
      </Panel>
      <Panel variant="tone" tone="peach" className="!p-4">
        <p className="text-[13px] font-bold leading-4 text-ink">Demand signal</p>
        <p className="mt-1.5 text-[12px] leading-[15px] text-body">{dash.data?.open_requests ?? 0} open resident requests and {dash.data?.active_deals ?? 0} deals already live.</p>
      </Panel>
    </div>
  );
}
