"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChipGroup, EmptyState, Note, PageHeader, Panel, Skeleton } from "@/components/ui";
import { VendorOfferCard } from "@/components/society-admin/deals/award/VendorOfferCard";
import { useAction } from "@/hooks/useAction";
import { dealsApi, jobsApi, partnersApi } from "@/lib/api/deals";

type Sort = "rating" | "reviews" | "name";

export default function AwardVendorPage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const [sort, setSort] = useState<Sort>("rating");
  const deal = useQuery({ queryKey: ["deal", id], queryFn: () => dealsApi.get(id) });
  const vendors = useQuery({
    queryKey: ["partners", "available", deal.data?.category],
    queryFn: () => partnersApi.available(deal.data!.category),
    enabled: !!deal.data,
  });

  const applications = useQuery({ queryKey: ["deal", id, "applications"], queryFn: () => dealsApi.applications(id) });
  const appOf = (partnerId: number) => applications.data?.find((a) => a.partner_id === partnerId && a.status !== "withdrawn");

  // Award = set the deal's vendor, then create one assigned job per confirmed booking.
  const award = useAction(
    async (partnerId: number) => {
      await dealsApi.update(id, { partner_id: partnerId });
      return jobsApi.fromDeal(id, { assigned_to_type: "partner", assigned_to_id: partnerId });
    },
    {
      success: (jobs) => `Vendor awarded · ${jobs.length} service job${jobs.length === 1 ? "" : "s"} created`,
      invalidate: [["deal"], ["deals"], ["jobs"], ["partners"]],
      onSuccess: () => router.push(`/society/deals/${id}`),
    },
  );

  const d = deal.data;
  const units = d ? d.max_units - d.available_units : 0;
  const list = [...(vendors.data ?? [])].sort((a, b) =>
    Number(!!appOf(b.id)) - Number(!!appOf(a.id)) ||
    (sort === "name" ? (a.business_name ?? a.name).localeCompare(b.business_name ?? b.name)
    : sort === "reviews" ? b.rating_count - a.rating_count
    : b.rating_avg - a.rating_avg || b.rating_count - a.rating_count),
  );
  const recommendedId = [...(vendors.data ?? [])].sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count)[0]?.id;

  return (
    <>
      <PageHeader
        breadcrumb={`Group deals / ${d?.title ?? "…"} / Award`}
        title="Pick the vendor,"
        light={`for ${units} unit${units === 1 ? "" : "s"} booked.`}
        actions={<ChipGroup size="sm" value={sort} onChange={setSort} options={[{ value: "rating", label: "Sort: rating" }, { value: "reviews", label: "Most rated" }, { value: "name", label: "Name" }]} />}
      />
      {deal.isLoading || vendors.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[520px] rounded-[26px]" />)}</div>
      ) : !list.length ? (
        <Panel><EmptyState title="No eligible vendors" hint="A verified vendor must be assigned to your society for this category. Contact the Odeslo team." /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {list.map((v) => (
            <VendorOfferCard key={v.id} vendor={v} price={d!.price_per_unit} units={units}
              recommended={v.id === recommendedId} awarded={v.id === d!.partner_id} application={appOf(v.id)}
              busy={award.isPending && award.variables === v.id} onAward={() => award.mutate(v.id)} />
          ))}
        </div>
      )}
      <Note className="mt-4 !rounded-[18px] !px-4 !py-3">
        On award: one service job is created for every confirmed booking and assigned to the vendor. Residents see the visit in their app.
      </Note>
    </>
  );
}
