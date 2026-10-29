import type { Booking, Deal, ServiceJob } from "@/lib/types/deal";
import type { Refund } from "@/lib/types/money";

export type SettlementStatus = "to_approve" | "paid" | "jobs_pending";

export interface SettlementRow {
  deal: Deal;
  jobs: ServiceJob[];
  units: number;
  collected: number;
  refunds: number;
  payout: number;
  commission: number;
  status: SettlementStatus;
  payableJobs: ServiceJob[];
  /** Set for jobs whose society (and deal) was deleted: the vendor is still owed / paid for them. */
  societyName?: string;
}

const PAID = new Set(["paid", "refund_pending", "refunded"]);

/** One row per deal that has partner jobs: money in, refunds out, vendor payout, platform commission. */
export function buildSettlement(deals: Deal[], jobs: ServiceJob[], bookings: Booking[], refunds: Refund[]): SettlementRow[] {
  const byDeal = new Map<number, ServiceJob[]>();
  jobs.filter((j) => j.deal_id != null && j.status !== "cancelled").forEach((j) => byDeal.set(j.deal_id!, [...(byDeal.get(j.deal_id!) ?? []), j]));

  // vendor jobs of a deleted society have no deal any more: one row per vendor and former society
  const orphans = new Map<string, ServiceJob[]>();
  jobs.filter((j) => j.deal_id == null && j.status !== "cancelled" && j.assigned_to_type === "partner")
    .forEach((j) => {
      const key = `${j.assigned_to_id}|${j.society_name ?? ""}`;
      orphans.set(key, [...(orphans.get(key) ?? []), j]);
    });
  const orphanRows: SettlementRow[] = [...orphans.values()].map((js, i) => {
    const name = js[0]!.society_name ?? "Deleted society";
    const payableJobs = js.filter((j) => j.status === "completed" && j.payout_status === "pending");
    const allDone = js.every((j) => j.status === "completed");
    const pseudo = { id: -(i + 1), society_id: null, title: `${name} · vendor jobs`, partner_id: js[0]!.assigned_to_id, partner_payout_per_unit: null, status: "completed" } as unknown as Deal;
    return {
      deal: pseudo, jobs: js, units: js.length, collected: 0, refunds: 0, payout: js.reduce((s, j) => s + (j.payout_amount ?? 0), 0),
      commission: 0, payableJobs, societyName: `${name} (deleted)`,
      status: (!allDone ? "jobs_pending" : payableJobs.length ? "to_approve" : "paid") as SettlementStatus,
    };
  });

  return [...deals
    .filter((d) => byDeal.has(d.id))
    .map((deal) => {
      const dealJobs = byDeal.get(deal.id)!;
      const dealBookings = bookings.filter((b) => b.deal_id === deal.id);
      const bookingIds = new Set(dealBookings.map((b) => b.id));
      const collected = dealBookings.filter((b) => PAID.has(b.payment_status)).reduce((s, b) => s + b.amount, 0);
      const refunded = refunds
        .filter((r) => r.booking_id != null && bookingIds.has(r.booking_id) && r.status !== "rejected")
        .reduce((s, r) => s + r.amount, 0);
      const units = dealBookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + b.units_count, 0);
      const payout = dealJobs.reduce((s, j) => s + (j.payout_amount ?? 0), 0) || (deal.partner_payout_per_unit ?? 0) * units;
      const payableJobs = dealJobs.filter((j) => j.status === "completed" && j.payout_status === "pending");
      const allDone = dealJobs.every((j) => j.status === "completed");
      const status: SettlementStatus = !allDone ? "jobs_pending" : payableJobs.length ? "to_approve" : "paid";
      return {
        deal, jobs: dealJobs, units, collected, refunds: refunded, payout,
        commission: Math.max(0, collected - refunded - payout), status, payableJobs,
      };
    }), ...orphanRows]
    .sort((a, b) => ["to_approve", "jobs_pending", "paid"].indexOf(a.status) - ["to_approve", "jobs_pending", "paid"].indexOf(b.status));
}

export function settlementCsv(rows: SettlementRow[], society: (id: number | null) => string) {
  const head = "Deal,Society,Units,Collected,Refunds,Commission,Payout,Status";
  const lines = rows.map((r) =>
    [r.deal.title, r.societyName ?? society(r.deal.society_id), r.units, r.collected, r.refunds, r.commission, r.payout, r.status].map((v) => `"${v}"`).join(","),
  );
  return [head, ...lines].join("\n");
}
