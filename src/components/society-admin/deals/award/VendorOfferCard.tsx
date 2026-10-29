import clsx from "clsx";
import { Badge, Button } from "@/components/ui";
import type { DealApplicationAdmin, PartnerBrief } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { inr, initials } from "@/lib/utils/format";

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-panel px-2.5 py-2">
      <p className="text-[10px] leading-3 text-muted">{label}</p>
      <p className="text-[13px] font-bold leading-4 text-ink">{value}</p>
    </div>
  );
}

interface Props {
  vendor: PartnerBrief;
  price: number;
  units: number;
  recommended?: boolean;
  awarded?: boolean;
  /** Set when this vendor applied for the deal. */
  application?: DealApplicationAdmin;
  busy?: boolean;
  onAward: () => void;
}

/** One vendor option on the award screen. */
export function VendorOfferCard({ vendor: v, price, units, recommended, awarded, application, busy, onAward }: Props) {
  const name = v.business_name ?? v.name;
  return (
    <article className={clsx("flex min-h-[520px] flex-col rounded-[26px] border bg-white p-[18px]", recommended || awarded ? "border-ink" : "border-line")}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center text-[15px] font-bold text-ink">{initials(name)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold leading-[21px] text-ink">{name}</p>
          <p className="text-[12px] leading-[15px] text-muted">{v.name !== name ? `Owner ${v.name}` : "Verified partner"}</p>
        </div>
        {awarded ? <Badge tone="green" dot={false}>Awarded</Badge>
          : application ? <Badge tone="yellow" dot={false}>Applied</Badge>
          : recommended ? <Badge tone="green" dot={false}>Recommended</Badge>
          : !v.rating_count ? <Badge tone="blue" dot={false}>New partner</Badge> : null}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-[32px] font-bold leading-10 tracking-[-0.96px] text-ink">{inr(price)}</p>
        <p className="pb-1.5 text-[12px] leading-[15px] text-muted">per unit · {inr(price * units)} total</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Mini label="Rating" value={v.rating_count ? `★ ${v.rating_avg.toFixed(1)}` : "—"} />
        <Mini label="Ratings" value={String(v.rating_count)} />
        <Mini label="Services" value={String(v.categories.length)} />
      </div>
      <div className="mt-3 space-y-1.5 text-[12px] leading-[15px]">
        <div className="flex justify-between"><span className="text-muted">Verification</span><span className="font-semibold text-green-fg">Verified by Odeslo ✓</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted">Categories</span><span className="truncate text-right font-semibold text-ink">{v.categories.map((c) => categoryOf(c).label).join(", ")}</span></div>
        <div className="flex justify-between"><span className="text-muted">Units to serve</span><span className="font-semibold text-ink">{units}</span></div>
      </div>
      {application && (
        <div className="mt-3 rounded-[14px] bg-yellow-bg px-3 py-2.5 text-[12px] leading-[16px] text-yellow-fg">
          <p className="font-bold">Applied{application.quote_per_unit != null ? ` · asks ${inr(application.quote_per_unit)} per unit` : ""}</p>
          {application.message && <p className="mt-0.5 font-medium">&ldquo;{application.message}&rdquo;</p>}
        </div>
      )}
      <p className="mt-3 rounded-[14px] bg-panel px-3 py-2.5 text-[12px] leading-[17.5px] text-body">
        {recommended ? "Highest rated vendor serving your society for this category." : v.rating_count ? `${v.rating_count} residents have rated this vendor.` : "No ratings yet — new on Odeslo."}
      </p>
      <div className="mt-auto pt-6">
        <Button block variant={recommended && !awarded ? "dark" : "light"} disabled={awarded} loading={busy} onClick={onAward}>
          {awarded ? "Current vendor" : "Award deal"}
        </Button>
      </div>
    </article>
  );
}
