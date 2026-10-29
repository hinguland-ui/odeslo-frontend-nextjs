import clsx from "clsx";
import type { Booking, Deal } from "@/lib/types/deal";
import { inr } from "@/lib/utils/format";

const STAGES: { label: string; on: (d: Deal, hasVendor: boolean) => boolean }[] = [
  { label: "Bookings open", on: (d) => d.status === "published" || d.status === "full" },
  { label: "Award vendor", on: (d, v) => d.status === "closed" && !v },
  { label: "Jobs scheduled", on: (d, v) => d.status === "closed" && v },
  { label: "Service", on: () => false },
  { label: "Completed", on: (d) => d.status === "completed" },
];

/** Dark strip: units booked, money collected, waitlist, price, cancellations + stage pills. */
export function DealSummaryBar({ deal, bookings }: { deal: Deal; bookings: Booking[] }) {
  const booked = deal.max_units - deal.available_units;
  const collected = bookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + b.amount, 0);
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const stats: [string, string, string?][] = [
    ["Units booked", `${booked} / ${deal.max_units}`],
    ["Collected", inr(collected)],
    ["Waitlist", String(deal.waitlist_count)],
    ["Price per unit", inr(deal.price_per_unit), "text-mint"],
    ["Cancelled (not counted)", String(cancelled), "text-rose-soft"],
  ];
  return (
    <div className="deep rounded-[24px] bg-ink px-[18px] py-4 text-white">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[11px] leading-[13px] text-night-muted">{label}</p>
            <p className={clsx("mt-0.5 text-[24px] font-bold leading-[30px]", color)}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <span key={s.label} className={clsx("rounded-full px-2.5 py-[5px] text-[11px] font-semibold leading-[13px]",
            s.on(deal, deal.partner_id != null) ? "bg-violet text-white" : "bg-night text-night-muted")}>
            {s.label}
          </span>
        ))}
        {deal.status === "cancelled" && <span className="rounded-full bg-pink-bg px-2.5 py-[5px] text-[11px] font-semibold text-pink-fg">Cancelled</span>}
      </div>
    </div>
  );
}
