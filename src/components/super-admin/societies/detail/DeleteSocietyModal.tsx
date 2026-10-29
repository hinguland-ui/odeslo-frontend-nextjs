"use client";

import { FullScreenLoader } from "@/components/ui/Preloader";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, Modal, Note, Skeleton } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { societiesApi } from "@/lib/api/societies";
import type { Society } from "@/lib/types/society";
import { formatBytes, inr, num } from "@/lib/utils/format";
import { Check } from "lucide-react";

const LABEL: Record<string, string> = {
  wings: "Wings", flats: "Flats", residents: "Residents (with family, vehicles, documents)", society_admins: "Society admins", staff: "Staff",
  deals: "Group deals", bookings: "Bookings", payments: "Resident payments", refunds: "Refunds", maintenance_bills: "Maintenance bills",
  complaints: "Complaints", requests: "Requests", announcements: "Notices", masjids: "Masjids added by the society", files: "Photos and documents",
};

/** Super admin: see everything a society holds, then delete it for good (type its code to confirm). Vendors and their payment history stay. */
export function DeleteSocietyModal({ society, onClose }: { society: Society; onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [media, setMedia] = useState(true);
  const preview = useQuery({ queryKey: ["society", society.id, "delete-preview"], queryFn: () => societiesApi.deletePreview(society.id), staleTime: 0 });
  const remove = useAction(() => societiesApi.remove(society.id, code, media), {
    success: `${society.name} was deleted`,
    invalidate: [["societies"], ["dashboard"], ["partners"], ["storage"]],
    onSuccess: () => router.push("/admin/societies"),
  });

  const p = preview.data;
  const rows = p ? Object.entries(p.delete).filter(([k, v]) => LABEL[k] && Number(v) > 0) : [];
  const match = code.trim().toUpperCase() === society.code.toUpperCase();
  const live = p && society.status === "active";

  return (
    <>
    {remove.isPending && <FullScreenLoader variant="orbit" label="Deleting the society and all of its data…" />}
    <Modal
      open
      onClose={onClose}
      width={620}
      title={`Delete ${society.name}?`}
      subtitle={`Code ${society.code} · ${society.area}, ${society.city} · ${society.status}`}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={remove.isPending} disabled={!match || !p} onClick={() => remove.mutate(undefined)}>Delete forever</Button>
        </>
      }
    >
      {preview.isLoading || !p ? (
        <Skeleton className="h-[260px] w-full" />
      ) : (
        <div className="space-y-4">
          {live && <Note tone="pink">This society is <strong>active</strong>: {p.delete.residents_by_status.active ?? 0} approved resident(s) can use it right now. They lose access immediately. Consider suspending it first.</Note>}
          <Note tone="yellow">This cannot be undone. Nothing can be restored afterwards.</Note>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-[18px] bg-pink-bg/60 p-3.5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.88px] text-pink-fg">Will be deleted</p>
              {rows.length === 0 ? <p className="text-[12px] text-body">No data besides the society itself.</p> : (
                <ul className="space-y-1">
                  {rows.map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-3 text-[12px] leading-4"><span className="text-body">{LABEL[k]}</span><span className="font-bold text-ink">{num(Number(v))}</span></li>
                  ))}
                </ul>
              )}
              {p.delete.payments > 0 && <p className="mt-2 text-[11px] text-body">Payments worth {inr(p.delete.payments_amount)} are removed from the records.</p>}
              {p.delete.files > 0 && <p className="mt-1 text-[11px] text-body">Uploads use {formatBytes(p.delete.files_bytes)}.</p>}
            </div>

            <div className="rounded-[18px] bg-green-bg/70 p-3.5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.88px] text-green-fg">Will be kept</p>
              <ul className="space-y-1.5 text-[12px] leading-4 text-body">
                <li><Check size={13} strokeWidth={3} className="mr-1 inline text-green-fg" />Every <strong className="text-ink">vendor</strong>: account, documents, ratings</li>
                <li><Check size={13} strokeWidth={3} className="mr-1 inline text-green-fg" />Their <strong className="text-ink">job and payout history</strong> ({num(p.keep.vendor_jobs)} job{p.keep.vendor_jobs === 1 ? "" : "s"}), without resident names, flats, chats or notes</li>
                {p.keep.vendor_payouts_pending > 0 && <li><Check size={13} strokeWidth={3} className="mr-1 inline text-green-fg" />{p.keep.vendor_payouts_pending} payout(s) still to pay ({inr(p.keep.vendor_payouts_pending_amount)}) stay in Settlement</li>}
                <li><Check size={13} strokeWidth={3} className="mr-1 inline text-green-fg" />Platform-level deals, notices and masjids</li>
                {p.keep.vendor_jobs_open > 0 && <li className="text-yellow-fg">! {p.keep.vendor_jobs_open} open vendor job(s) will be cancelled</li>}
                {p.keep.vendors_assigned > 0 && <li>• {p.keep.vendors_assigned} vendor(s) lose this society from their list</li>}
              </ul>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] bg-mist px-3.5 py-3 text-[12px] leading-4">
            <input type="checkbox" checked={media} onChange={(e) => setMedia(e.target.checked)} className="mt-0.5 size-4 accent-ink" />
            <span>
              <span className="font-bold text-ink">Also delete all photos and documents</span> ({formatBytes(p.delete.files_bytes)})
              <span className="block text-muted">{media ? "Files are erased from the server." : "Files stay on the server, readable by super admins only, and still count in Storage."}</span>
            </span>
          </label>

          <Field label={`Type the society code ${society.code} to confirm`}>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={society.code} autoComplete="off" />
          </Field>
        </div>
      )}
    </Modal>
    </>
  );
}
