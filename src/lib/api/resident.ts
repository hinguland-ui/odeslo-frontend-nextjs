import { api, type Page } from "./client";
import type { Booking, Deal } from "@/lib/types/deal";
import type { HomeSummary } from "@/lib/types/live";
import type { Announcement, Complaint, ComplaintDetail, Notification } from "@/lib/types/ops";
import type { Resident, ResidentDetail } from "@/lib/types/resident";
import type {
  BookingDetail,
  FamilyMember,
  MyMaintenance,
  MySociety,
  PaymentOrder,
  PaymentRow,
  PublicSociety,
  PublicUnit,
  PublicWing,
  Req,
  ResidentHome,
  Vehicle,
} from "@/lib/types/portal";

/** Everything the logged-in resident can do on the web. */
export const residentApi = {
  home: () => api.get<ResidentHome>("/dashboard/resident/home"),
  mySociety: () => api.get<MySociety>("/dashboard/resident/my-society"),

  // profile
  me: () => api.get<ResidentDetail>("/residents/me"),
  updateMe: (body: { name?: string; email?: string | null; emergency_contact_name?: string | null; emergency_contact_mobile?: string | null }) =>
    api.patch<Resident>("/residents/me", body),
  /** Every home (flat / society) of this person, for the switcher. */
  homes: () => api.get<HomeSummary[]>("/residents/me/homes"),
  /** Continue as the same person in another home. Returns a new session token. */
  switchHome: (id: number) => api.post<{ session: boolean; user_type: string; user_id: number; status: string }>(`/residents/me/switch/${id}`),
  /** Ask for another home; that society's admin approves it. Name, email and emergency contact default to the profile. */
  addHome: (body: { society_id: number; wing_id: number; unit_id: number; resident_type: string; name?: string; email?: string | null; emergency_contact_name?: string | null; emergency_contact_mobile?: string | null }) =>
    api.post<Resident>("/residents/me/homes", body),
  family: () => api.get<FamilyMember[]>("/residents/me/family"),
  addFamily: (body: { name: string; relation: string; mobile?: string | null; grant_app_access?: boolean }) =>
    api.post<FamilyMember>("/residents/me/family", body),
  removeFamily: (id: number) => api.del(`/residents/me/family/${id}`),
  addTenant: (body: { name: string; mobile: string; email?: string | null; maintenance_visible?: boolean }) =>
    api.post<Resident>("/residents/me/tenant", body),
  vehicles: () => api.get<Vehicle[]>("/residents/me/vehicles"),
  addVehicle: (body: { vehicle_type: string; vehicle_number: string; parking_slot?: string | null }) =>
    api.post<Vehicle>("/residents/me/vehicles", body),
  /** Ownership / rent / ID proof (index_ii, sale_deed, rent_agreement, electricity_bill, id_proof, other). */
  uploadDocument: (doc_type: string, file: File, residentId?: number) => {
    const f = new FormData();
    f.set("doc_type", doc_type);
    f.set("file", file);
    if (residentId) f.set("resident_id", String(residentId));
    return api.form<{ id: number; doc_type: string }>("/residents/me/documents", f);
  },
  removeVehicle: (id: number) => api.del(`/residents/me/vehicles/${id}`),

  // group deals & bookings
  deals: (category?: string) => api.get<Deal[]>("/group-deals/available", { category }),
  book: (deal_id: number, units_count: number, slot?: string) =>
    api.post<Booking>("/bookings", { deal_id, units_count, slot: slot || null }),
  bookings: (tab: "active" | "completed" | "cancelled" | "all") => api.get<Page<Booking>>("/bookings/my", { tab, page_size: 100 }),
  booking: (id: number) => api.get<BookingDetail>(`/bookings/${id}`),
  cancelBooking: (id: number, reason?: string) => api.post<Booking>(`/bookings/${id}/cancel`, { reason: reason || null }),
  changeSlot: (id: number, slot: string) => api.patch<Booking>(`/bookings/${id}/slot`, { slot }),
  rate: (id: number, rating: number, feedback?: string) => api.post<Booking>(`/bookings/${id}/rate`, { rating, feedback: feedback || null }),

  // maintenance & payments
  maintenance: () => api.get<MyMaintenance>("/maintenance/my"),
  payments: () => api.get<Page<PaymentRow>>("/payments/my", { page_size: 50 }),
  initiatePayment: (ref_type: "booking" | "maintenance", ref_id: number) => api.post<PaymentOrder>("/payments/initiate", { ref_type, ref_id }),
  verifyPayment: (b: { payment_id: number; gateway_order_id: string; gateway_payment_id: string; signature: string }) =>
    api.post<PaymentRow>("/payments/verify", b),
  failPayment: (payment_id: number, reason: string) => api.post<PaymentRow>("/payments/fail", { payment_id, reason }),

  // complaints
  complaints: () => api.get<Page<Complaint>>("/complaints/my", { page_size: 100 }),
  complaint: (id: number) => api.get<ComplaintDetail>(`/complaints/${id}`),
  raiseComplaint: (form: FormData) => api.form<Complaint>("/complaints", form),
  comment: (id: number, comment: string) => api.post(`/complaints/${id}/comments`, { comment }),
  closeComplaint: (id: number) => api.post<Complaint>(`/complaints/${id}/close`),
  reopenComplaint: (id: number, reason: string) => api.post<Complaint>(`/complaints/${id}/reopen`, { reason }),

  // requests
  requestTypes: () => api.get<{ value: string; label: string }[]>("/requests/types"),
  requests: () => api.get<Page<Req>>("/requests/my", { page_size: 100 }),
  raiseRequest: (form: FormData) => api.form<Req>("/requests", form),
  withdrawRequest: (id: number) => api.post<Req>(`/requests/${id}/withdraw`),

  // notices & notifications
  announcements: () => api.get<Page<Announcement>>("/announcements", { page_size: 50 }),
  notifications: (unread_only = false) => api.get<Page<Notification>>("/notifications", { page_size: 50, unread_only }),
  unreadCount: () => api.get<{ total: number; by_category: Record<string, number> }>("/notifications/unread-count"),
  markRead: (id: number) => api.post<Notification>(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
};

/** Public lookups used by the sign-up form (no login needed). */
export const publicApi = {
  searchSocieties: (q: string, near?: { lat: number; lng: number }) =>
    api.get<PublicSociety[]>("/societies/public/search", { q, lat: near?.lat, lng: near?.lng }),
  byCode: (code: string) => api.get<PublicSociety>(`/societies/public/by-code/${encodeURIComponent(code.trim())}`),
  wings: (societyId: number) => api.get<PublicWing[]>(`/societies/public/${societyId}/wings`),
  units: (wingId: number) => api.get<PublicUnit[]>(`/societies/public/wings/${wingId}/units`),
};
