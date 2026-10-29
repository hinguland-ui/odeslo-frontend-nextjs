"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Badge, Button, ErrorState, KeyValue, Modal, Skeleton, StatusBadge } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { paymentsApi } from "@/lib/api/money";
import { fullDate, time, titleCase } from "@/lib/utils/format";

const rupees = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const when = (d?: string | null) => (d ? `${fullDate(d)}, ${time(d)}` : "—");

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[18px] bg-panel p-3.5">
      <p className="mb-2.5 text-[11px] font-bold uppercase leading-[13px] tracking-[0.88px] text-muted">{title}</p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/** One payment in full: who paid, who got it, through which society, for what, how, refunds and a timeline. */
export function PaymentDetailModal({ paymentId, onClose }: { paymentId: number | null; onClose: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ["payment", paymentId], queryFn: () => paymentsApi.details(paymentId!), enabled: paymentId != null });
  const d = q.data;

  const download = async () => {
    if (!d) return;
    setBusy(true);
    try {
      await paymentsApi.downloadInvoice(d.id, d.txn_id);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not download the invoice", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={paymentId != null}
      onClose={onClose}
      width={760}
      title={d ? <span className="flex items-center gap-2.5">{rupees(d.amount)} <StatusBadge status={d.status} /></span> : "Payment"}
      subtitle={d ? `${d.txn_id} · ${d.invoice_no}` : undefined}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Close</Button>
          <Button disabled={!d || d.status !== "success" || busy} loading={busy} onClick={download}>
            {d && d.status !== "success" ? "Invoice after payment" : "Download invoice (PDF)"}
          </Button>
        </>
      }
    >
      {q.isLoading && <Skeleton className="h-[320px] w-full" />}
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      {d && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Section title="Paid by">
              <p className="text-[14px] font-bold leading-[18px] text-ink">{d.payer?.name ?? "—"}</p>
              {d.payer?.unit && <KeyValue label="Flat" value={d.payer.unit} />}
              {d.payer?.resident_type && <KeyValue label="Is the" value={titleCase(d.payer.resident_type)} />}
              {d.payer?.mobile && <KeyValue label="Mobile" value={d.payer.mobile} />}
              {d.payer?.email && <p className="break-all text-[11px] text-muted">{d.payer.email}</p>}
            </Section>
            <Section title="Through society">
              <p className="text-[14px] font-bold leading-[18px] text-ink">{d.society.name}</p>
              <KeyValue label="Code" value={d.society.code} />
              <p className="text-[11px] leading-[15px] text-muted">{d.society.address}, {d.society.area}, {d.society.city}, {d.society.state} {d.society.pincode}</p>
            </Section>
            <Section title="Paid to">
              <p className="text-[14px] font-bold leading-[18px] text-ink">{d.paid_to.name}</p>
              <Badge tone={d.paid_to.kind === "vendor" ? "green" : "blue"} dot={false} size="sm">{d.paid_to.kind === "vendor" ? "Vendor" : "Society"}</Badge>
              <p className="text-[11px] leading-[15px] text-muted">{d.paid_to.detail}</p>
            </Section>
          </div>

          <Section title={d.ref_type === "booking" ? "For group deal" : "For maintenance"}>
            <p className="text-[13px] font-bold text-ink">{d.purpose.title}</p>
            <div className="overflow-hidden rounded-[14px] bg-white">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="bg-mist text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
                    <th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {d.purpose.lines.map((l, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-3 py-2"><span className="font-semibold text-ink">{l.description}</span>{l.detail && <span className="block text-[11px] text-muted">{l.detail}</span>}</td>
                      <td className="px-3 py-2 text-right">{l.qty}</td>
                      <td className="px-3 py-2 text-right">{rupees(l.rate)}</td>
                      <td className="px-3 py-2 text-right font-bold text-ink">{rupees(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {d.ref_type === "booking" && <KeyValue label="Booking" value={`${d.purpose.meta.booking_no} · ${titleCase(String(d.purpose.meta.booking_status))}`} />}
            {d.ref_type === "maintenance" && <KeyValue label="Bill" value={`${d.purpose.meta.bill_no} · ${titleCase(String(d.purpose.meta.bill_status))}`} />}
          </Section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Section title="Payment">
              <KeyValue label="Amount" value={rupees(d.amount)} valueClass="text-[14px]" />
              <KeyValue label="Mode" value={d.mode_label} />
              <KeyValue label="Started" value={when(d.created_at)} />
              <KeyValue label="Paid on" value={when(d.paid_at)} />
              {d.recorded_by && <KeyValue label="Recorded by" value={`${d.recorded_by.name} (${titleCase(d.recorded_by.type)})`} />}
              {d.failure_reason && <p className="rounded-[10px] bg-pink-bg px-2.5 py-1.5 text-[11px] font-semibold text-pink-fg">{d.failure_reason}</p>}
              {d.notes && <p className="text-[11px] text-body">Note: {d.notes}</p>}
            </Section>
            <Section title="Gateway & references">
              <KeyValue label="Gateway" value={d.gateway.name ? titleCase(d.gateway.name) : "—"} />
              <KeyValue label="Payment ID" value={<span className="break-all">{d.gateway.payment_id ?? "—"}</span>} />
              <KeyValue label="Order ID" value={<span className="break-all">{d.gateway.order_id ?? "—"}</span>} />
              <KeyValue label="Reference no." value={d.gateway.reference_no ?? "—"} />
              <KeyValue label="Transaction" value={d.txn_id} />
            </Section>
          </div>

          {d.refunds.length > 0 && (
            <Section title={`Refunds · ${rupees(d.refunded_total)}`}>
              {d.refunds.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-ink">{r.refund_no} · {rupees(r.amount)}</p>
                    {r.reason && <p className="truncate text-[11px] text-muted">{r.reason}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </Section>
          )}

          <Section title="Timeline">
            <ol className="space-y-1.5">
              {d.timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[12px]">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" />
                  <span className="flex-1 text-ink">{t.label}</span>
                  <span className="shrink-0 text-muted">{when(t.at)}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </Modal>
  );
}
