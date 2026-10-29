"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { Badge, Button, KeyValue, Note, Panel, PanelTitle } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { openFile } from "@/lib/api/client";
import { partnersApi } from "@/lib/api/deals";
import type { Partner } from "@/lib/types/deal";
import type { Society } from "@/lib/types/society";
import { categoryOf } from "@/lib/utils/categories";
import { fullDate } from "@/lib/utils/format";
import { Check, Plus } from "lucide-react";

const BANK_LABEL: Record<string, string> = { account_name: "Account name", account_no: "Account no.", ifsc: "IFSC", upi_id: "UPI" };

/** Business details, documents, payout account and society assignment of one vendor. */
export function VendorOverview({ partner: p, societies }: { partner: Partner; societies: Society[] }) {
  const toast = useToast();
  const [assigned, setAssigned] = useState<number[]>(p.society_ids);
  const dirty = assigned.slice().sort().join() !== p.society_ids.slice().sort().join();
  const save = useAction(() => partnersApi.setSocieties(p.id, assigned), { success: "Societies updated", invalidate: [["partners"]] });
  const toggle = (id: number) => setAssigned((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const open = (path: string) => openFile(path).catch((e: Error) => toast(e.message, "error"));
  const bank = p.bank_details ?? {};
  const hasBank = Object.values(bank).some(Boolean);
  const mine = societies.filter((s) => p.society_ids.includes(s.id));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Panel>
        <PanelTitle>Business details</PanelTitle>
        <div className="space-y-2.5">
          <KeyValue label="Owner" value={p.name} />
          <KeyValue label="Business" value={p.business_name ?? "—"} />
          <KeyValue label="Mobile" value={`+91 ${p.mobile}`} />
          <KeyValue label="Email" value={p.email ?? "—"} />
          <KeyValue label="GST" value={p.gst ?? "—"} />
          <KeyValue label="Joined" value={fullDate(p.created_at)} />
          <KeyValue label="Verified on" value={p.verified_at ? fullDate(p.verified_at) : "Not verified"} valueClass={p.verified ? "text-green-fg" : "text-yellow-fg"} />
        </div>
        <p className="mb-1.5 mt-4 text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Services</p>
        <div className="flex flex-wrap gap-1.5">{p.categories.map((c) => <Badge key={c} tone={categoryOf(c).tone} dot={false}>{categoryOf(c).label}</Badge>)}</div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Documents</PanelTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="light" disabled={!p.id_proof} onClick={() => open(p.id_proof)}>View ID proof</Button>
            <Button variant="light" disabled={!p.photo} onClick={() => open(p.photo)}>View photo</Button>
          </div>
        </Panel>
        <Panel>
          <PanelTitle>Payout account</PanelTitle>
          {hasBank ? (
            <div className="space-y-2.5">{Object.entries(bank).filter(([, v]) => v).map(([k, v]) => <KeyValue key={k} label={BANK_LABEL[k] ?? k} value={v} />)}</div>
          ) : <Note tone="yellow">The vendor has not added bank or UPI details yet.</Note>}
        </Panel>
      </div>

      <Panel className="xl:col-span-2">
        <PanelTitle aside={`${p.society_ids.length} assigned`}>Societies</PanelTitle>
        <div className="flex flex-wrap gap-2">
          {societies.map((s) => {
            const on = assigned.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggle(s.id)} className={clsx("h-[34px] rounded-[17px] px-4 text-[12px] font-semibold transition", on ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line")}>
                {on ? <Check size={13} strokeWidth={3} className="mr-1 inline" /> : <Plus size={13} strokeWidth={3} className="mr-1 inline" />}{s.name}
              </button>
            );
          })}
        </div>
        {dirty && <Button size="sm" className="mt-3" loading={save.isPending} onClick={() => save.mutate(undefined)}>Save societies</Button>}
        {mine.length > 0 && (
          <p className="mt-3 text-[12px] text-muted">
            Open a society: {mine.map((s, i) => <span key={s.id}>{i > 0 && ", "}<Link className="font-semibold text-lilac-fg hover:underline" href={`/admin/societies/${s.id}`}>{s.name}</Link></span>)}
          </p>
        )}
      </Panel>
    </div>
  );
}
