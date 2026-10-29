import clsx from "clsx";
import type { Refund } from "@/lib/types/money";
import { dayMonth } from "@/lib/utils/format";
import { Check } from "lucide-react";

const STEPS = ["requested", "approved", "processed", "completed"] as const;

/** Vertical stepper: done (ink ✓), current (violet), upcoming (grey). */
export function RefundTimeline({ refund }: { refund: Refund }) {
  const at: Record<string, string | null> = {
    requested: refund.created_at, approved: refund.approved_at, processed: refund.processed_at, completed: refund.completed_at,
  };
  const sub: Record<string, string> = {
    requested: `Raised by ${refund.requested_by_type ?? "resident"} · ${dayMonth(refund.created_at)}`,
    approved: refund.approved_at ? `By ${refund.approved_by_type ?? "admin"} · ${dayMonth(refund.approved_at)}` : "Waiting for you",
    processed: refund.processed_at ? `${refund.mode === "manual" ? "Manual transfer" : "Gateway refund"} · ${dayMonth(refund.processed_at)}` : "Gateway or manual refund",
    completed: refund.completed_at ? `Resident notified · ${dayMonth(refund.completed_at)}` : "Resident notified",
  };
  const rejected = refund.status === "rejected";
  const currentIdx = rejected ? -1 : STEPS.findIndex((s) => !at[s]);

  return (
    <div className="rounded-[18px] bg-white p-3.5">
      {STEPS.map((s, i) => {
        const done = !!at[s];
        const current = i === currentIdx;
        return (
          <div key={s} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span className={clsx("grid size-[18px] place-items-center rounded-full text-[10px] font-bold text-white", done ? "bg-ink" : current ? "bg-violet" : "bg-off")}>{done ? <Check size={11} strokeWidth={3.4} /> : null}</span>
              {i < STEPS.length - 1 && <span className="h-[19px] w-0.5 bg-off" />}
            </div>
            <div className="pb-1">
              <p className={clsx("text-[13px] leading-4", done || current ? "font-bold text-ink" : "font-medium text-arrow")}>{s[0]!.toUpperCase() + s.slice(1)}</p>
              <p className="text-[11px] leading-[13px] text-muted">{sub[s]}</p>
            </div>
          </div>
        );
      })}
      {rejected && <p className="mt-2 rounded-[12px] bg-pink-bg px-3 py-2 text-[12px] font-medium text-pink-fg">Rejected: {refund.rejection_reason}</p>}
    </div>
  );
}
