"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import clsx from "clsx";
import { Avatar, Badge, Button, Eyebrow, KeyValue, Panel } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { partnersApi } from "@/lib/api/deals";
import type { Partner } from "@/lib/types/deal";
import type { Society } from "@/lib/types/society";
import { categoryOf } from "@/lib/utils/categories";
import { dayMonth, inr } from "@/lib/utils/format";

const INVALIDATE = [["partners"], ["dashboard"]];

export function vendorStatus(p: Partner): { tone: "green" | "yellow" | "pink"; label: string } {
  if (p.status !== "active") return { tone: "pink", label: "On hold" };
  return p.verified ? { tone: "green", label: "Verified" } : { tone: "yellow", label: "Pending" };
}

/** Right panel: documents, payout account, society assignment and verify actions. */
export function VendorAside({ partner, societies }: { partner: Partner; societies: Society[] }) {
  const detail = useQuery({ queryKey: ["partners", partner.id], queryFn: () => partnersApi.get(partner.id) });
  const earnings = useQuery({ queryKey: ["partners", partner.id, "earnings"], queryFn: () => partnersApi.earnings(partner.id) });
  const [assigned, setAssigned] = useState<number[]>(partner.society_ids);
  const dirty = assigned.slice().sort().join() !== partner.society_ids.slice().sort().join();

  const saveSocieties = useAction(() => partnersApi.setSocieties(partner.id, assigned), { success: "Societies updated", invalidate: INVALIDATE });
  const verify = useAction(() => partnersApi.verify(partner.id), { success: "Vendor verified", invalidate: INVALIDATE });
  const unverify = useAction(() => partnersApi.unverify(partner.id), { success: "Verification removed", invalidate: INVALIDATE });
  const hold = useAction(() => partnersApi.deactivate(partner.id), { success: "Vendor put on hold", invalidate: INVALIDATE });
  const activate = useAction(() => partnersApi.activate(partner.id), { success: "Vendor reactivated", invalidate: INVALIDATE });

  const st = vendorStatus(partner);
  const bank = detail.data?.bank_details;
  const bankText = bank ? Object.values(bank).filter(Boolean).slice(0, 2).join(" · ") : null;
  const toggle = (id: number) => setAssigned((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <Panel variant="soft" as="aside" className="flex min-h-[712px] flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[12px] leading-[15px] text-muted">Verification</span>
        <Badge tone={st.tone} dot={false}>{st.label}</Badge>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={partner.business_name ?? partner.name} size={48} shape="rounded" />
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold leading-[22px] text-ink">{partner.business_name ?? partner.name}</p>
          <p className="truncate text-[12px] leading-[15px] text-muted">
            {partner.categories.map((c) => categoryOf(c).label).join(", ")} · {partner.mobile}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2 rounded-[18px] bg-white p-3.5">
        <KeyValue label="Owner ID" value={partner.id_proof ? "Uploaded ✓" : "Missing"} valueClass={partner.id_proof ? "text-green-fg" : "text-pink-fg"} />
        <KeyValue label="GST number" value={partner.gst ?? "—"} />
        <KeyValue label="Bank / UPI for payouts" value={bankText ?? "Not added"} valueClass={bankText ? undefined : "text-yellow-fg"} />
        <KeyValue label="Rating" value={partner.rating_count ? `★ ${partner.rating_avg.toFixed(1)} (${partner.rating_count})` : "No ratings"} />
        <KeyValue label="Earned · pending" value={earnings.data ? `${inr(earnings.data.total_earned)} · ${inr(earnings.data.pending)}` : "…"} />
        <KeyValue label={partner.verified ? "Verified on" : "Joined"} value={dayMonth(partner.verified_at ?? partner.created_at)} valueClass="text-green-fg" />
      </div>

      <Button variant="white" size="sm" className="mt-3 self-start" href={`/admin/vendors/${partner.id}`}>Full details &amp; history →</Button>

      <Eyebrow className="mt-3 text-muted">Assign to societies</Eyebrow>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {societies.map((s) => {
          const on = assigned.includes(s.id);
          return (
            <button key={s.id} onClick={() => toggle(s.id)}
              className={clsx("h-[29px] rounded-[14.5px] px-3 text-[12px] font-semibold transition", on ? "bg-ink text-white" : "bg-white text-ink hover:bg-mist")}>
              {on ? s.name : `+ ${s.name}`}
            </button>
          );
        })}
      </div>
      {dirty && (
        <Button size="sm" variant="white" className="mt-2 self-start" loading={saveSocieties.isPending} onClick={() => saveSocieties.mutate(undefined)}>
          Save societies
        </Button>
      )}

      <div className="mt-auto flex gap-2 pt-6">
        {partner.status !== "active" ? (
          <Button className="flex-1" loading={activate.isPending} onClick={() => activate.mutate(undefined)}>Reactivate vendor</Button>
        ) : partner.verified ? (
          <Button variant="white" className="flex-1" loading={unverify.isPending} onClick={() => unverify.mutate(undefined)}>Remove verification</Button>
        ) : (
          <Button className="flex-1" loading={verify.isPending} onClick={() => verify.mutate(undefined)}>Verify vendor</Button>
        )}
        {partner.status === "active" && (
          <Button variant="danger" loading={hold.isPending} onClick={() => hold.mutate(undefined)}>{partner.verified ? "Hold" : "Reject"}</Button>
        )}
      </div>
    </Panel>
  );
}
