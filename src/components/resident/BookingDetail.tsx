"use client";

import { FullScreenLoader } from "@/components/ui/Preloader";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { Badge, Button, EmptyState, Field, KeyValue, Modal, Note, Panel, ReasonModal, Select, StatusBadge, Textarea } from "@/components/ui";
import { JobChat } from "@/components/live/JobChat";
import { TrackVendor } from "@/components/live/TrackVendor";
import { useAction } from "@/hooks/useAction";
import { usePay } from "@/hooks/usePay";
import { residentApi } from "@/lib/api/resident";
import { categoryOf } from "@/lib/utils/categories";
import { dayMonth, fullDate, inr, time } from "@/lib/utils/format";
import { statusLabel } from "@/lib/utils/status";

function RateModal({ loading, onClose, onConfirm }: { loading?: boolean; onClose: () => void; onConfirm: (rating: number, feedback: string) => void }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  return (
    <Modal
      open
      onClose={onClose}
      title="Rate this service"
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={loading} onClick={() => onConfirm(rating, feedback.trim())}>Submit</Button></>}
    >
      <div className="space-y-4">
        <div className="flex gap-1.5 text-[28px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? "text-yellow-fg" : "text-line"} aria-label={`${n} star`}>★</button>
          ))}
        </div>
        <Field label="Feedback (optional)"><Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How was the service?" /></Field>
      </div>
    </Modal>
  );
}

function SlotModal({ slots, current, loading, onClose, onConfirm }: { slots: string[]; current: string | null; loading?: boolean; onClose: () => void; onConfirm: (slot: string) => void }) {
  const [slot, setSlot] = useState(current ?? "");
  return (
    <Modal
      open
      onClose={onClose}
      title="Change time slot"
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={loading} disabled={!slot || slot === current} onClick={() => onConfirm(slot)}>Save slot</Button></>}
    >
      <Field label="Time slot">
        <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
          <option value="">Choose…</option>
          {slots.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>
    </Modal>
  );
}

/** One booking: status, payments, technician job, and the actions the backend allows. */
export function BookingDetail({ bookingId }: { bookingId: number }) {
  const [modal, setModal] = useState<"cancel" | "rate" | "slot" | null>(null);
  const q = useQuery({ queryKey: ["resident", "booking", bookingId], queryFn: () => residentApi.booking(bookingId) });
  const pay = usePay();
  const done = () => setModal(null);
  const refresh = [["resident"]];
  const cancel = useAction((reason: string) => residentApi.cancelBooking(bookingId, reason), { invalidate: refresh, success: "Booking cancelled", onSuccess: done });
  const rate = useAction((a: { rating: number; feedback: string }) => residentApi.rate(bookingId, a.rating, a.feedback), { invalidate: refresh, success: "Thanks for rating", onSuccess: done });
  const slot = useAction((s: string) => residentApi.changeSlot(bookingId, s), { invalidate: refresh, success: "Slot updated", onSuccess: done });

  const b = q.data;
  if (q.isLoading) return <Panel variant="soft"><PageLoader minHeight={420} /></Panel>;
  if (!b) return <Panel variant="soft"><EmptyState title="Could not load this booking" /></Panel>;

  const slots = (b.deal.slots as string[] | undefined) ?? [];
  const active = ["pending_payment", "confirmed", "waitlisted"].includes(b.status);

  return (
    <Panel variant="soft" as="aside" className="flex flex-col gap-4">
      {pay.isPending && <FullScreenLoader variant="spin" label="Payment in progress… keep this page open" />}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted">{b.booking_no}</p>
          <h2 className="mt-0.5 text-[16px] font-bold leading-[21px] text-ink">{b.deal_title}</h2>
          <p className="text-[12px] text-body">{categoryOf(b.deal_category).label} · {fullDate(b.service_date)}</p>
        </div>
        <StatusBadge status={b.status} />
      </div>

      {b.status === "pending_payment" && b.hold_expires_at && (
        <Note tone="yellow">Pay by {dayMonth(b.hold_expires_at)} {time(b.hold_expires_at)} or this booking is released.</Note>
      )}
      {b.status === "waitlisted" && <Note tone="lilac">You are #{b.waitlist_position ?? "—"} on the waitlist. You will be promoted automatically if a unit frees up.</Note>}
      {b.cancel_reason && <Note tone="pink">Cancelled: {b.cancel_reason}</Note>}

      <div className="space-y-2 rounded-[16px] bg-white p-3.5">
        <KeyValue label="Units" value={b.units_count} />
        <KeyValue label="Slot" value={b.slot ?? "—"} />
        <KeyValue label="Amount" value={inr(b.amount)} />
        <div className="flex items-center justify-between text-[12px]"><span className="text-body">Payment</span><Badge tone={b.payment_status === "paid" ? "green" : b.payment_status === "unpaid" ? "yellow" : "lilac"}>{statusLabel(b.payment_status)}</Badge></div>
      </div>

      {b.job && (
        <div className="space-y-2 rounded-[16px] bg-white p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Service visit</p>
          <div className="flex items-center justify-between text-[12px]"><span className="text-body">{b.job.job_no}</span>{b.job.status && <StatusBadge status={b.job.status} />}</div>
          {b.job.assignee_name && <KeyValue label="Technician" value={b.job.assignee_name} />}
          {b.job.scheduled_at && <KeyValue label="Scheduled" value={`${dayMonth(b.job.scheduled_at)} · ${time(b.job.scheduled_at)}`} />}
        </div>
      )}

      {b.job?.id && b.job.status && ["on_the_way", "started"].includes(b.job.status) && (
        <TrackVendor jobId={b.job.id} jobStatus={b.job.status} />
      )}
      {b.job?.id && b.job.status !== "created" && (
        <JobChat jobId={b.job.id} closed={b.job.status === "cancelled"} title="Chat with your vendor" />
      )}

      {b.payments.length > 0 && (
        <div className="space-y-1.5 rounded-[16px] bg-white p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Payments</p>
          {b.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-[12px]"><span className="text-body">{p.txn_id}</span><span className="font-semibold text-ink">{inr(p.amount)} · {statusLabel(p.status)}</span></div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {b.can_pay && <Button size="lg" loading={pay.isPending} onClick={() => pay.mutate({ refType: "booking", refId: b.id })}>Pay {inr(b.amount)}</Button>}
        {b.can_rate && <Button variant="success" onClick={() => setModal("rate")}>Rate this service</Button>}
        {active && slots.length > 0 && <Button variant="light" onClick={() => setModal("slot")}>Change slot</Button>}
        {b.can_cancel && <Button variant="danger" onClick={() => setModal("cancel")}>Cancel booking</Button>}
      </div>

      {modal === "cancel" && <ReasonModal open title="Cancel this booking?" confirmLabel="Cancel booking" placeholder="Why are you cancelling?" loading={cancel.isPending} onClose={() => setModal(null)} onConfirm={(r) => cancel.mutate(r)} />}
      {modal === "rate" && <RateModal loading={rate.isPending} onClose={() => setModal(null)} onConfirm={(rating, feedback) => rate.mutate({ rating, feedback })} />}
      {modal === "slot" && <SlotModal slots={slots} current={b.slot} loading={slot.isPending} onClose={() => setModal(null)} onConfirm={(s) => slot.mutate(s)} />}
    </Panel>
  );
}
