"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { AudiencePanel } from "@/components/society-admin/deals/new/AudiencePanel";
import { CategoryPicker } from "@/components/society-admin/deals/new/CategoryPicker";
import { DealSettings, type DealDraft } from "@/components/society-admin/deals/new/DealSettings";
import { useAction } from "@/hooks/useAction";
import { useMySociety } from "@/hooks/useMe";
import { dealsApi } from "@/lib/api/deals";
import { categoryOf } from "@/lib/utils/categories";
import { isoDate } from "@/lib/utils/format";

const STEPS = ["1 Go live", "2 Residents book", "3 You award one vendor", "4 Jobs scheduled", "5 Service & payment"];
const at = (days: number) => new Date(Date.now() + days * 86_400_000);

export default function LaunchDealPage() {
  const router = useRouter();
  const society = useMySociety();
  const [d, setD] = useState<DealDraft>({
    title: categoryOf("ac").label, category: "ac", description: "",
    cutoff_date: `${isoDate(at(6))}T18:00`, service_date: isoDate(at(8)), slots: "10:00 - 13:00, 14:00 - 17:00",
    price_per_unit: 0, max_units: 25, pay_later_allowed: true, auto_promote_waitlist: true,
    cancel_policy: "Free cancellation before the booking cut-off.",
  });
  const set = <K extends keyof DealDraft>(k: K, v: DealDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const pickCategory = (c: string) => setD((x) => ({ ...x, category: c, title: x.title === categoryOf(x.category).label || !x.title ? categoryOf(c).label : x.title }));

  const valid = d.title.trim().length >= 3 && d.price_per_unit > 0 && d.max_units > 0 && d.cutoff_date.slice(0, 10) <= d.service_date;
  const save = useAction(
    async (live: boolean) => {
      const deal = await dealsApi.create({
        title: d.title.trim(), category: d.category, description: d.description || null,
        service_date: d.service_date, cutoff_date: `${d.cutoff_date}:00`,
        slots: d.slots.split(",").map((s) => s.trim()).filter(Boolean),
        price_per_unit: d.price_per_unit, max_units: d.max_units, cancel_policy: d.cancel_policy,
        pay_later_allowed: d.pay_later_allowed, auto_promote_waitlist: d.auto_promote_waitlist,
      });
      return live ? dealsApi.publish(deal.id) : deal;
    },
    {
      success: (x) => (x.status === "published" ? `${x.title} is live for residents` : "Draft saved"),
      invalidate: [["deals"], ["dashboard"]],
      onSuccess: (x) => router.push(`/society/deals/${x.id}`),
    },
  );

  return (
    <>
      <PageHeader
        breadcrumb="Group deals / New deal"
        title="Launch a deal,"
        light="residents book together."
        actions={
          <>
            <Button variant="light" disabled={!valid} loading={save.isPending && save.variables === false} onClick={() => save.mutate(false)}>Save draft</Button>
            <button disabled={!valid || save.isPending} onClick={() => save.mutate(true)}
              className="inline-flex h-11 items-center gap-3 rounded-[22px] bg-ink pl-[5px] pr-[18px] text-[13px] font-semibold text-white transition hover:bg-ink-soft disabled:opacity-50">
              <span className="grid size-[34px] place-items-center rounded-full bg-ink-soft"><Image src="/icons/arrow-right.svg" alt="" width={16} height={16} className="dark:invert" /></span>
              Go live · notify residents
            </button>
          </>
        }
      />
      <div className="mb-3.5 flex flex-wrap items-center gap-2 rounded-[18px] bg-panel px-4 py-3">
        {STEPS.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-[12px] font-semibold text-arrow">→</span>}
            <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold leading-[15px] ${i === 0 ? "bg-ink text-white" : "bg-white text-ink"}`}>{s}</span>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <CategoryPicker value={d.category} onChange={pickCategory} />
        <DealSettings d={d} set={set} />
        <AudiencePanel category={d.category} city={society.data?.city} />
      </div>
    </>
  );
}
