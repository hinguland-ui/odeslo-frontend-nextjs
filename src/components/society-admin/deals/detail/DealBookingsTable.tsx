"use client";

import { Badge, Button, DataTable, EmptyState, type Column } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { bookingsApi } from "@/lib/api/deals";
import type { Booking } from "@/lib/types/deal";
import type { Resident } from "@/lib/types/resident";
import { inr, unitLabel } from "@/lib/utils/format";
import type { Tone } from "@/lib/utils/tones";

function bookingBadge(b: Booking): [Tone, string] {
  if (b.status === "cancelled") return ["pink", "Cancelled"];
  if (b.status === "waitlisted") return ["yellow", `Waitlist #${b.waitlist_position ?? "—"}`];
  if (b.status === "completed") return ["lilac", "Completed"];
  if (b.payment_status === "paid") return ["green", "Paid"];
  return ["yellow", "Payment pending"];
}

export function DealBookingsTable({ bookings, residents, loading }: { bookings: Booking[]; residents: Map<number, Resident>; loading: boolean }) {
  const promote = useAction((id: number) => bookingsApi.promote(id), { success: "Moved off the waitlist", invalidate: [["deal"], ["deals"]] });

  const columns: Column<Booking>[] = [
    { key: "u", header: "Unit", width: "0.7fr", render: (b) => { const r = residents.get(b.resident_id); return <span className="font-bold">{r ? unitLabel(r.wing_name, r.unit_no) : `#${b.unit_id}`}</span>; } },
    { key: "r", header: "Resident", width: "1.4fr", render: (b) => <span className={b.status === "cancelled" ? "font-semibold line-through" : "font-semibold"}>{residents.get(b.resident_id)?.name ?? `Resident #${b.resident_id}`}</span> },
    { key: "n", header: "Units", width: "0.5fr", render: (b) => b.units_count },
    { key: "p", header: "Paid", width: "0.9fr", render: (b) => <span className="font-semibold">{b.payment_status === "paid" ? inr(b.amount) : b.payment_status === "refunded" ? `${inr(b.amount)} refunded` : "—"}</span> },
    { key: "s", header: "Status", width: "1.1fr", render: (b) => { const [t, l] = bookingBadge(b); return <Badge tone={t}>{l}</Badge>; } },
    {
      key: "a", header: "", width: "0.7fr",
      render: (b) => b.status === "waitlisted" ? (
        <Button size="sm" variant="light" className="!h-8 !px-3 !text-[12px]" loading={promote.isPending && promote.variables === b.id} onClick={() => promote.mutate(b.id)}>Promote</Button>
      ) : null,
    },
  ];

  return (
    <DataTable columns={columns} rows={bookings} rowKey={(b) => b.id} loading={loading} rowHeight={40}
      rowClassName={(b) => (b.status === "cancelled" ? "opacity-55" : undefined)} className="min-h-[586px]"
      empty={<EmptyState title="No bookings yet" hint="Residents book from the app once the deal is live." />} />
  );
}
