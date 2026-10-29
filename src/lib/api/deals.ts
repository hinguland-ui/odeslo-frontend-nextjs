import { api, type Page } from "./client";
import type { Booking, Deal, DealApplicationAdmin, PartnerApplication, DealCreate, Earnings, Partner, PartnerBrief, ServiceJob, ServiceJobDetail } from "@/lib/types/deal";

export const dealsApi = {
  categories: () => api.get<{ value: string; label: string }[]>("/group-deals/categories"),
  list: (q: { status?: string; category?: string; society_id?: number; include_platform?: boolean } = {}) =>
    api.get<Page<Deal>>("/group-deals", { page_size: 200, ...q }),
  get: (id: number) => api.get<Deal>(`/group-deals/${id}`),
  create: (body: DealCreate) => api.post<Deal>("/group-deals", body),
  update: (id: number, body: Partial<DealCreate>) => api.patch<Deal>(`/group-deals/${id}`, body),
  publish: (id: number) => api.post<Deal>(`/group-deals/${id}/publish`),
  close: (id: number) => api.post<Deal>(`/group-deals/${id}/close`),
  complete: (id: number) => api.post<Deal>(`/group-deals/${id}/complete`),
  cancel: (id: number, reason: string) => api.post<Deal>(`/group-deals/${id}/cancel`, { reason }),
  applications: (id: number) => api.get<DealApplicationAdmin[]>(`/group-deals/${id}/applications`),
  bookings: (id: number, status?: string) => api.get<Booking[]>(`/group-deals/${id}/bookings`, { status }),
};

export const bookingsApi = {
  list: (q: { status?: string; deal_id?: number; society_id?: number; exclude_cancelled?: boolean; page?: number } = {}) =>
    api.get<Page<Booking>>("/bookings", { page_size: 200, ...q }),
  waitlist: (deal_id?: number) => api.get<Page<Booking>>("/bookings/waitlist", { deal_id, page_size: 200 }),
  promote: (id: number) => api.post<Booking>(`/bookings/${id}/promote`),
  cancel: (id: number, reason: string) => api.post<Booking>(`/bookings/${id}/cancel`, { reason }),
};

export const jobsApi = {
  list: (q: { status?: string; deal_id?: number; scheduled_on?: string; assigned_to_type?: string; assigned_to_id?: number; escalated?: boolean; society_id?: number } = {}) =>
    api.get<Page<ServiceJob>>("/service-jobs", { page_size: 200, ...q }),
  get: (id: number) => api.get<ServiceJobDetail>(`/service-jobs/${id}`),
  fromDeal: (dealId: number, body: { assigned_to_type?: string; assigned_to_id?: number; scheduled_at?: string }) =>
    api.post<ServiceJob[]>(`/service-jobs/from-deal/${dealId}`, body),
  assign: (id: number, body: { assigned_to_type: string; assigned_to_id: number; scheduled_at?: string; slot?: string }) =>
    api.post<ServiceJobDetail>(`/service-jobs/${id}/assign`, body),
  cancel: (id: number, reason: string) => api.post<ServiceJobDetail>(`/service-jobs/${id}/cancel`, { reason }),
  payout: (id: number, reference: string, amount?: number) =>
    api.post<ServiceJobDetail>(`/service-jobs/${id}/payout`, { reference, amount }),
};

export const partnersApi = {
  list: (q: { verified?: boolean; category?: string; status?: string; society_id?: number } = {}) =>
    api.get<Page<Partner>>("/service-partners", { page_size: 200, ...q }),
  get: (id: number) => api.get<Partner>(`/service-partners/${id}`),
  available: (category?: string) => api.get<PartnerBrief[]>("/service-partners/available", { category }),
  create: (form: FormData) => api.form<Partner>("/service-partners", form),
  verify: (id: number) => api.post<Partner>(`/service-partners/${id}/verify`),
  unverify: (id: number) => api.post<Partner>(`/service-partners/${id}/unverify`),
  deactivate: (id: number) => api.post<Partner>(`/service-partners/${id}/deactivate`),
  activate: (id: number) => api.post<Partner>(`/service-partners/${id}/activate`),
  setSocieties: (id: number, society_ids: number[]) => api.put<Partner>(`/service-partners/${id}/societies`, { society_ids }),
  earnings: (id: number) => api.get<Earnings>(`/service-partners/${id}/earnings`),
  applications: (id: number) => api.get<PartnerApplication[]>(`/service-partners/${id}/applications`),
};
