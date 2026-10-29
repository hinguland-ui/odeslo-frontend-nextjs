"use client";

import { useState } from "react";
import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { paymentsApi } from "@/lib/api/money";
import type { Bill } from "@/lib/types/money";
import { inr } from "@/lib/utils/format";

/** Record cash / cheque / UPI / bank transfer paid at the office against an unpaid bill. */
export function OfflinePaymentModal({ open, onClose, bills, initialBillId }: { open: boolean; onClose: () => void; bills: Bill[]; initialBillId?: number }) {
  const unpaid = bills.filter((b) => b.outstanding > 0);
  const [billId, setBillId] = useState<number>(initialBillId ?? unpaid[0]?.id ?? 0);
  const bill = unpaid.find((b) => b.id === billId);
  const [amount, setAmount] = useState<number>(bill?.outstanding ?? 0);
  const [mode, setMode] = useState("cash");
  const [ref, setRef] = useState("");

  const record = useAction(() => paymentsApi.recordOffline({ ref_type: "maintenance", ref_id: billId, amount, mode, reference_no: ref || undefined }), {
    success: "Payment recorded, receipt sent to the resident",
    invalidate: [["bills"], ["maintenance"], ["dashboard"], ["payments"]],
    onSuccess: onClose,
  });

  return (
    <Modal open={open} onClose={onClose} title="Mark offline payment" subtitle="Cash, cheque or UPI paid to the office"
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button disabled={!billId || amount <= 0} loading={record.isPending} onClick={() => record.mutate(undefined)}>Record payment</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bill" className="col-span-2">
          <Select value={billId} onChange={(e) => { const id = Number(e.target.value); setBillId(id); setAmount(unpaid.find((b) => b.id === id)?.outstanding ?? 0); }}>
            {unpaid.map((b) => <option key={b.id} value={b.id}>{b.unit_label ?? `Unit #${b.unit_id}`} · {b.period} · {inr(b.outstanding)} due</option>)}
          </Select>
        </Field>
        <Field label="Amount (₹)"><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></Field>
        <Field label="Mode">
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="cash">Cash</option><option value="cheque">Cheque</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option>
          </Select>
        </Field>
        <Field label="Reference (cheque / UTR no.)" className="col-span-2"><Input value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}
