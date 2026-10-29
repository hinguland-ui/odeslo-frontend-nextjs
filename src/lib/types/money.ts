export interface Payment {
  id: number;
  txn_id: string;
  society_id: number;
  resident_id: number | null;
  unit_id: number | null;
  ref_type: "booking" | "maintenance" | string;
  ref_id: number;
  amount: number;
  mode: string;
  gateway: string | null;
  reference_no: string | null;
  status: "initiated" | "success" | "failed" | "pending" | string;
  paid_at: string | null;
  failure_reason: string | null;
  notes: string | null;
  created_at: string;
}

export type RefundStatus = "requested" | "approved" | "processed" | "completed" | "rejected";

export interface Refund {
  id: number;
  refund_no: string;
  payment_id: number;
  booking_id: number | null;
  society_id: number;
  resident_id: number | null;
  amount: number;
  reason: string | null;
  status: RefundStatus;
  mode: string | null;
  reference_no: string | null;
  rejection_reason: string | null;
  requested_by_type: string | null;
  approved_by_type: string | null;
  approved_at: string | null;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Bill {
  id: number;
  bill_no: string;
  society_id: number;
  unit_id: number;
  resident_id: number | null;
  period: string;
  period_start: string;
  period_end: string;
  amount: number;
  late_fee: number;
  paid_amount: number;
  total_amount: number;
  outstanding: number;
  due_date: string;
  status: "generated" | "due" | "paid" | "overdue" | "partially_paid" | string;
  reminder_count: number;
  last_reminder_at: string | null;
  paid_at: string | null;
  unit_label: string | null;
}

export interface MaintenanceSummary {
  period: string | null;
  billed: number;
  collected: number;
  pending: number;
  bills: number;
  paid_bills: number;
  overdue_bills: number;
}

export interface Defaulter {
  unit_id: number;
  unit_label: string;
  resident_name: string | null;
  resident_mobile: string | null;
  unpaid_bills: number;
  outstanding: number;
  oldest_due_date: string;
}

export interface PaymentDetails {
  id: number;
  txn_id: string;
  invoice_no: string;
  status: string;
  amount: number;
  mode: string;
  mode_label: string;
  paid_at: string | null;
  created_at: string;
  failure_reason: string | null;
  notes: string | null;
  ref_type: "booking" | "maintenance" | string;
  ref_id: number;
  purpose: {
    title: string;
    lines: { description: string; detail: string | null; qty: number; rate: number; amount: number }[];
    meta: Record<string, string | number | null>;
  };
  society: { id: number; name: string; code: string; address: string; area: string; city: string; state: string; pincode: string; registration_number: string | null };
  payer: { id?: number; name?: string; mobile?: string; email?: string | null; resident_type?: string; unit?: string | null } | null;
  paid_to: { kind: "vendor" | "society"; name: string; detail: string };
  gateway: { name: string | null; order_id: string | null; payment_id: string | null; reference_no: string | null };
  recorded_by: { type: string; name: string } | null;
  refunds: { id: number; refund_no: string; amount: number; status: string; reason: string | null; created_at: string; completed_at: string | null }[];
  refunded_total: number;
  timeline: { label: string; at: string }[];
}
