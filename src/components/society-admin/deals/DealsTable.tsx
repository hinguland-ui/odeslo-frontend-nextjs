"use client";

import Link from "next/link";
import clsx from "clsx";
import { Avatar, Badge, EmptyState, Progress, Skeleton } from "@/components/ui";
import type { Deal } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { dayMonth, daysUntil, inr } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";

const GRID = "grid grid-cols-[minmax(170px,1.6fr)_124px_80px_70px_minmax(90px,0.8fr)] items-center gap-2";

/** Closes column: "2 days" (yellow when ≤ 2), "Full", or the deal status once booking is shut. */
function ClosesBadge({ deal }: { deal: Deal }) {
  if (deal.status === "full") return <Badge tone="green" dot={false}>Full</Badge>;
  if (deal.status !== "published") return <Badge tone={statusTone(deal.status)} dot={false}>{statusLabel(deal.status)}</Badge>;
  const days = daysUntil(deal.cutoff_date);
  if (days < 0) return <Badge tone="pink" dot={false}>Closed</Badge>;
  return (
    <Badge tone={days <= 2 ? "yellow" : "gray"} dot={false} className={days > 2 ? "!text-ink" : undefined}>
      {days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`}
    </Badge>
  );
}

export function DealRow({ deal, href }: { deal: Deal; href?: string }) {
  const c = categoryOf(deal.category);
  const booked = deal.max_units - deal.available_units;
  const row = (
    <div className={clsx(GRID, "min-h-[46px] rounded-[14px] px-3 py-1.5 transition", href && "hover:bg-row-hi")}>
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar label={c.abbr} tone={c.tone} size={34} shape="rounded" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-4 text-ink">{deal.title}</p>
          <p className="truncate text-[11px] leading-[13px] text-muted">
            {deal.society_id === null ? "Platform" : "Service"} · {dayMonth(deal.service_date)}
          </p>
        </div>
      </div>
      <div className="pr-4">
        <p className="text-[12px] font-semibold leading-[15px] text-ink">
          {booked} / {deal.max_units}
        </p>
        <Progress value={booked} max={deal.max_units} className="mt-[5px] w-[108px]" />
      </div>
      <p className="text-[13px] font-bold leading-4 text-ink">{inr(deal.price_per_unit)}</p>
      <p className="text-[13px] leading-4 text-body">{deal.waitlist_count || "—"}</p>
      <div>
        <ClosesBadge deal={deal} />
      </div>
    </div>
  );
  return href ? <Link href={href}>{row}</Link> : row;
}

export function DealsTable({ deals, loading, hrefFor }: { deals?: Deal[]; loading?: boolean; hrefFor?: (d: Deal) => string }) {
  return (
    <div>
      <div className={clsx(GRID, "h-[29px] rounded-[12px] bg-mist px-3 text-[11px] font-semibold leading-[13px] text-muted")}>
        <span>Deal</span>
        <span>Units booked</span>
        <span>Price now</span>
        <span>Waitlist</span>
        <span>Closes</span>
      </div>
      <div className="mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[46px]" />)
        ) : !deals?.length ? (
          <EmptyState title="No live deals" hint="Launch a group deal so residents can book together." />
        ) : (
          deals.map((d) => <DealRow key={d.id} deal={d} href={hrefFor?.(d)} />)
        )}
      </div>
    </div>
  );
}
