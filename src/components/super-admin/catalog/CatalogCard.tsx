import clsx from "clsx";
import { daysUntil, inr } from "@/lib/utils/format";
import { categoryOf } from "@/lib/utils/categories";
import { statusLabel } from "@/lib/utils/status";
import { TONE } from "@/lib/utils/tones";
import type { Deal } from "@/lib/types/deal";

const STATUS_FG: Record<string, string> = {
  published: "text-green-fg", full: "text-lilac-fg", draft: "text-yellow-fg", closed: "text-blue-fg", completed: "text-lilac-fg", cancelled: "text-pink-fg",
};

/** Pastel catalog tile: category mark, status, pricing strip, reach line. */
export function CatalogCard({ deal, vendor, society, onClick }: { deal: Deal; vendor: string; society: string; onClick: () => void }) {
  const c = categoryOf(deal.category);
  const commission = deal.partner_payout_per_unit != null ? deal.price_per_unit - deal.partner_payout_per_unit : null;
  const reach =
    deal.status === "draft"
      ? deal.society_id ? `Local item · ${society}` : "Draft · not published yet"
      : deal.society_id ? `${society} · society deal` : "Live in all societies";
  const cutoff = daysUntil(deal.cutoff_date);

  return (
    <button onClick={onClick} className={clsx("flex min-h-[187px] flex-col rounded-[22px] p-3.5 text-left transition hover:brightness-[0.98]", TONE[c.tone].bg)}>
      <div className="flex w-full items-center justify-between">
        <span className={clsx("grid size-10 place-items-center rounded-[13px] bg-white text-[10px] font-bold", TONE[c.tone].fg)}>{c.abbr}</span>
        <span className={clsx("rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold leading-[13px]", STATUS_FG[deal.status] ?? "text-body")}>
          {deal.status === "draft" && deal.society_id ? "Pending review" : statusLabel(deal.status)}
        </span>
      </div>
      <p className="mt-2.5 truncate text-[14px] font-bold leading-[18px] text-ink">{deal.title}</p>
      <p className="truncate text-[11px] leading-[13px] text-body">{c.label} · {vendor}</p>
      <div className="mt-2.5 grid grid-cols-3 rounded-[14px] bg-white px-2 py-2 text-center">
        {[
          ["Price", inr(deal.price_per_unit)],
          ["Vendor", deal.partner_payout_per_unit != null ? inr(deal.partner_payout_per_unit) : "—"],
          ["You earn", commission != null ? inr(commission) : "—"],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-[10px] leading-3 text-muted">{l}</p>
            <p className="text-[12px] font-bold leading-[15px] text-ink">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-auto pt-2.5 text-[11px] leading-[13px] text-body">
        {reach}{deal.status === "published" && cutoff >= 0 ? ` · closes in ${cutoff}d` : ""}
      </p>
    </button>
  );
}
