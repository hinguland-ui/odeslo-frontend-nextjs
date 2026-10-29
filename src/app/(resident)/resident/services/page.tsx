"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Badge, Button, Chip, EmptyState, PageHeader, Panel, Progress, Skeleton } from "@/components/ui";
import { BookDealModal } from "@/components/resident/BookDealModal";
import { useAction } from "@/hooks/useAction";
import { residentApi } from "@/lib/api/resident";
import type { Deal } from "@/lib/types/deal";
import { CATEGORY_KEYS, categoryOf } from "@/lib/utils/categories";
import { fullDate, inr } from "@/lib/utils/format";

export default function ResidentServicesPage() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [booking, setBooking] = useState<Deal | null>(null);
  const deals = useQuery({ queryKey: ["resident", "deals"], queryFn: () => residentApi.deals() });

  const book = useAction((a: { id: number; units: number; slot?: string }) => residentApi.book(a.id, a.units, a.slot), {
    invalidate: [["resident"]],
    success: (b) => (b.status === "waitlisted" ? "Added to the waitlist" : "Booked. Complete the payment to confirm."),
    onSuccess: () => {
      setBooking(null);
      router.push("/resident/bookings");
    },
  });

  const all = deals.data ?? [];
  const present = [...new Set(all.map((d) => d.category))];
  const list = all.filter((d) => category === "all" || d.category === category);

  return (
    <>
      <PageHeader title="Group deals," light={`${all.length} open in your society.`} subtitle="Book together with your neighbours and pay less." />

      <div className="mb-4 flex flex-wrap gap-2">
        <Chip size="sm" active={category === "all"} onClick={() => setCategory("all")}>All · {all.length}</Chip>
        {present.map((c) => (
          <Chip key={c} size="sm" active={category === c} onClick={() => setCategory(c)}>{categoryOf(c).label} · {all.filter((d) => d.category === c).length}</Chip>
        ))}
      </div>

      {deals.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[260px] rounded-[24px]" />)}</div>
      ) : list.length === 0 ? (
        <Panel><EmptyState title="No open deals right now" hint="New group deals from your society appear here." /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {list.map((d) => {
            const cat = categoryOf(d.category);
            const full = d.available_units <= 0;
            return (
              <Panel key={d.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <Avatar label={cat.abbr} tone={cat.tone} size={44} shape="rounded" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold leading-[19px] text-ink">{d.title}</p>
                    <p className="text-[12px] text-muted">{cat.label} · {fullDate(d.service_date)}</p>
                  </div>
                  {full ? <Badge tone="yellow" dot={false}>Full</Badge> : <Badge tone="green" dot={false}>Open</Badge>}
                </div>
                {d.description && <p className="mt-3 line-clamp-2 text-[12px] leading-4 text-body">{d.description}</p>}
                <p className="mt-3 text-[28px] font-bold leading-9 tracking-[-0.8px] text-ink">{inr(d.price_per_unit)}<span className="ml-1 text-[12px] font-medium text-muted">per unit</span></p>
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-[11px] text-muted"><span>{d.confirmed_units} booked</span><span>{Math.max(d.available_units, 0)} left of {d.max_units}</span></div>
                  <Progress value={d.confirmed_units} max={d.max_units} />
                </div>
                {d.slots.length > 0 && <p className="mt-2 text-[11px] text-muted">Slots: {d.slots.join(", ")}</p>}
                <div className="mt-auto pt-4">
                  <Button block disabled={!d.is_booking_open && !full} onClick={() => setBooking(d)}>
                    {full ? (d.waitlist_count ? `Join waitlist (${d.waitlist_count} waiting)` : "Join waitlist") : "Book now"}
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <BookDealModal
        key={booking?.id ?? "none"}
        deal={booking}
        loading={book.isPending}
        onClose={() => setBooking(null)}
        onConfirm={(units, slot) => booking && book.mutate({ id: booking.id, units, slot })}
      />
    </>
  );
}
