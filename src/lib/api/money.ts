import { api, type Page } from "./client";
import type { Bill, Defaulter, MaintenanceSummary, Payment, PaymentDetails, Refund } from "@/lib/types/money";

type PaymentQuery = { status?: string; ref_type?: string; mode?: string; date_from?: string; date_to?: string; society_id?: number; page?: number };

export const paymentsApi = {
  list: (q: PaymentQuery = {}) => api.get<Page<Payment>>("/payments", { page_size: 200, ...q }),
  /** Who paid, to whom, via which society, for what, how, and what happened to it. */
  details: (id: number) => api.get<PaymentDetails>(`/payments/${id}/details`),
  /** The invoice / receipt of a successful payment, saved as a PDF. */
  downloadInvoice: (id: number, txn: string) => api.download(`/payments/${id}/invoice`, {}, `Invoice-${txn}.pdf`),
  exportCsv: (q: PaymentQuery = {}) => api.download("/payments/export", q, "payments.csv"),
  recordOffline: (body: { ref_type: string; ref_id: number; amount: number; mode: string; reference_no?: string; notes?: string }) =>
    api.post<Payment>("/payments/offline", body),
};

export const refundsApi = {
  list: (q: { status?: string; society_id?: number } = {}) => api.get<Page<Refund>>("/refunds", { page_size: 200, ...q }),
  approve: (id: number) => api.post<Refund>(`/refunds/${id}/approve`),
  reject: (id: number, reason: string) => api.post<Refund>(`/refunds/${id}/reject`, { reason }),
  process: (id: number, mode: "gateway" | "manual", reference_no?: string) =>
    api.post<Refund>(`/refunds/${id}/process`, { mode, reference_no }),
  complete: (id: number) => api.post<Refund>(`/refunds/${id}/complete`),
};

export const maintenanceApi = {
  summary: (period?: string, society_id?: number) => api.get<MaintenanceSummary>("/maintenance/summary", { period, society_id }),
  bills: (q: { period?: string; status?: string; unpaid_only?: boolean; society_id?: number } = {}) =>
    api.get<Page<Bill>>("/maintenance/bills", { page_size: 200, ...q }),
  defaulters: () => api.get<Defaulter[]>("/maintenance/defaulters"),
  generate: (body: { period_start?: string; include_vacant?: boolean; notify_residents?: boolean }) =>
    api.post<{ period: string; created: number; skipped_existing: number; total_amount: number }>("/maintenance/bills/generate", body),
  remind: (bill_ids?: number[], sms = false) => api.post<{ reminded: number }>("/maintenance/reminders", { bill_ids, sms }),
};
