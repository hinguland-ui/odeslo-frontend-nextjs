import { api, type Page } from "./client";
import type { Deal, DealApplication, Earnings, PartnerSociety, Partner, ServiceJob, ServiceJobDetail } from "@/lib/types/deal";
import type { Notification } from "@/lib/types/ops";

export type JobView = "today" | "upcoming" | "active" | "history";
export type VendorJobStatus = "accepted" | "on_the_way" | "started" | "completed";

export interface VendorProfileUpdate {
  email?: string | null;
  business_name?: string | null;
  bank_details?: { account_name?: string | null; account_no?: string | null; ifsc?: string | null; upi_id?: string | null };
}

/** Everything the logged-in vendor (service partner) can do. */
export const vendorApi = {
  profile: () => api.get<Partner>("/service-partners/me"),
  updateProfile: (body: VendorProfileUpdate) => api.patch<Partner>("/service-partners/me", body),
  /** Societies assigned to this vendor with vendor counts. */
  societies: () => api.get<PartnerSociety[]>("/service-partners/me/societies"),
  earnings: () => api.get<Earnings>("/service-partners/me/earnings"),

  /** Open deals in the vendor's societies / categories that nobody has been awarded yet. */
  opportunities: () => api.get<Deal[]>("/group-deals/opportunities"),
  applications: () => api.get<DealApplication[]>("/group-deals/my-applications"),
  apply: (dealId: number, quote_per_unit?: number, message?: string) =>
    api.post<DealApplication>(`/group-deals/${dealId}/apply`, { quote_per_unit: quote_per_unit ?? null, message: message || null }),
  withdraw: (dealId: number) => api.post<DealApplication>(`/group-deals/${dealId}/withdraw`),
  /** Group deals awarded to this vendor. */
  deals: (status?: string) => api.get<Deal[]>("/group-deals/mine", { status }),

  notifications: (unread_only = false) => api.get<Page<Notification>>("/notifications", { page_size: 50, unread_only }),
  unreadCount: () => api.get<{ total: number; by_category: Record<string, number> }>("/notifications/unread-count"),
  markRead: (id: number) => api.post<Notification>(`/notifications/${id}/read`),
  markAllRead: () => api.post<{ message?: string }>("/notifications/read-all"),

  jobs: (view: JobView) => api.get<ServiceJob[]>("/service-jobs/my", { view }),
  job: (id: number) => api.get<ServiceJobDetail>(`/service-jobs/${id}`),
  /** Accepted → On the way → Started → Completed. Completing needs a photo or a note. */
  setStatus: (id: number, status: VendorJobStatus, note?: string, photo?: File | null) => {
    const form = new FormData();
    form.set("status", status);
    if (note) form.set("note", note);
    if (photo) form.set("photo", photo);
    return api.form<ServiceJobDetail>(`/service-jobs/${id}/status`, form);
  },
  reportIssue: (id: number, note: string, reschedule_to?: string) =>
    api.post<ServiceJobDetail>(`/service-jobs/${id}/issue`, { note, reschedule_to: reschedule_to || null }),
};
