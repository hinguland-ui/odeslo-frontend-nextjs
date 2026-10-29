"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Panel } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { jobsApi, partnersApi } from "@/lib/api/deals";
import { notificationsApi } from "@/lib/api/ops";
import type { Deal } from "@/lib/types/deal";
import { dayMonth, inr } from "@/lib/utils/format";

/** Vendor status, what happens next and a reminder broadcast. */
export function DealAside({ deal }: { deal: Deal }) {
  const vendors = useQuery({ queryKey: ["partners", "available", deal.category], queryFn: () => partnersApi.available(deal.category) });
  const jobs = useQuery({ queryKey: ["jobs", "deal", deal.id], queryFn: () => jobsApi.list({ deal_id: deal.id }) });
  const awarded = vendors.data?.find((v) => v.id === deal.partner_id);

  const remind = useAction(
    () => notificationsApi.send({
      title: `${deal.title}: book before ${dayMonth(deal.cutoff_date)}`,
      body: `${deal.available_units} of ${deal.max_units} units left at ${inr(deal.price_per_unit)} per unit. Book from the Odeslo app.`,
      target: "residents",
    }),
    { success: (r) => `Reminder sent to ${r.recipients} residents` },
  );

  return (
    <div className="space-y-3">
      <Panel className="!p-4">
        <p className="text-[13px] font-bold leading-4 text-ink">{awarded || deal.partner_id ? "Awarded vendor" : `Eligible vendors · ${vendors.data?.length ?? "…"}`}</p>
        <div className="mt-2.5 space-y-2.5">
          {(awarded ? [awarded] : vendors.data?.slice(0, 4) ?? []).map((v) => (
            <div key={v.id} className="flex items-center gap-2.5">
              <Avatar name={v.business_name ?? v.name} label={(v.business_name ?? v.name).split(" ").map((w) => w[0]).join("").slice(0, 2)} size={34} shape="rounded" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-4 text-ink">{v.business_name ?? v.name}</p>
                <p className="truncate text-[11px] leading-[13px] text-muted">{v.rating_count ? `★ ${v.rating_avg.toFixed(1)} · ${v.rating_count} ratings` : "New partner"}</p>
              </div>
              {awarded && <span className="text-[13px] font-bold text-green-fg">Awarded</span>}
            </div>
          ))}
          {!vendors.isLoading && !vendors.data?.length && !deal.partner_id && (
            <p className="text-[12px] leading-[15px] text-muted">No verified vendor serves this category for your society yet. Ask the Odeslo team to add one.</p>
          )}
        </div>
        {jobs.data && jobs.data.total > 0 && <p className="mt-2.5 text-[12px] text-body">{jobs.data.total} service jobs created</p>}
      </Panel>
      <Panel variant="tone" tone="lilac" className="!p-4">
        <p className="text-[13px] font-bold leading-4 text-lilac-fg">After you award</p>
        <p className="mt-1.5 text-[12px] leading-[15px] text-body">
          One service job is created per confirmed booking and assigned to the vendor. Residents see their slot, and pay the rest before or after service.
        </p>
      </Panel>
      {(deal.status === "published" || deal.status === "full") && (
        <Button variant="light" block loading={remind.isPending} onClick={() => remind.mutate(undefined)}>Remind residents</Button>
      )}
    </div>
  );
}
