import { api, type Page } from "./client";
import type { StorageUsage, ActivityLog, Announcement, Complaint, ComplaintDetail, Masjid, MasjidTiming, Notification, Setting, Staff, Timetable } from "@/lib/types/ops";

export const complaintsApi = {
  list: (q: { status?: string; priority?: string; open_only?: boolean; society_id?: number } = {}) =>
    api.get<Page<Complaint>>("/complaints", { page_size: 200, ...q }),
  get: (id: number) => api.get<ComplaintDetail>(`/complaints/${id}`),
  assign: (id: number, staff_id: number, note?: string) => api.post<ComplaintDetail>(`/complaints/${id}/assign`, { staff_id, note }),
  setStatus: (id: number, status: "in_progress" | "resolved", note?: string) =>
    api.post<ComplaintDetail>(`/complaints/${id}/status`, { status, note }),
  comment: (id: number, comment: string) => api.post(`/complaints/${id}/comments`, { comment }),
};

export const staffApi = {
  list: (q: { type?: string; status?: string } = {}) => api.get<Page<Staff>>("/staff", { page_size: 200, ...q }),
  create: (form: FormData) => api.form<Staff>("/staff", form),
  deactivate: (id: number) => api.post<Staff>(`/staff/${id}/deactivate`),
  activate: (id: number) => api.post<Staff>(`/staff/${id}/activate`),
};

export const announcementsApi = {
  list: () => api.get<Page<Announcement>>("/announcements", { page_size: 50 }),
  create: (form: FormData) => api.form<Announcement>("/announcements", form),
  remove: (id: number) => api.del(`/announcements/${id}`),
};

export const masjidsApi = {
  list: (q: { status?: string; q?: string } = {}) => api.get<Page<Masjid>>("/masjids", { page_size: 200, ...q }),
  pending: () => api.get<{ masjids: Masjid[]; timings: MasjidTiming[] }>("/masjids/pending"),
  get: (id: number) => api.get<Masjid>(`/masjids/${id}`),
  create: (body: Partial<Masjid>) => api.post<Masjid>("/masjids", body),
  timings: (id: number) => api.get<MasjidTiming[]>(`/masjids/${id}/timings`),
  submitTimings: (id: number, body: Record<string, string | null>) => api.post<MasjidTiming>(`/masjids/${id}/timings`, body),
  timetable: (id: number) => api.get<Timetable>(`/masjids/${id}/timetable`),
  prayerTimes: (lat: number, lng: number) => api.get<Timetable>("/masjids/prayer-times", { lat, lng }),
  verify: (id: number) => api.post<Masjid>(`/masjids/${id}/verify`),
  reject: (id: number, reason: string) => api.post<Masjid>(`/masjids/${id}/reject`, { reason }),
  verifyTiming: (id: number) => api.post<MasjidTiming>(`/masjids/timings/${id}/verify`),
  rejectTiming: (id: number, reason: string) => api.post<MasjidTiming>(`/masjids/timings/${id}/reject`, { reason }),
};

export const storageApi = {
  /** Super admin: space used per society. */
  usage: () => api.get<StorageUsage>("/files/usage/summary"),
};

export const settingsApi = {
  list: () => api.get<Setting[]>("/settings"),
  update: (key: string, value: Record<string, unknown>) => api.put<Setting>(`/settings/${key}`, { value }),
  /** Asks Razorpay if the saved keys are valid (no money moves). */
  testGateway: () => api.post<{ ok: boolean; mode: string; message: string }>("/settings/payment-gateway/test"),
  /** The saved secrets of one setting in clear text (for the "show" eye). The server logs every use. */
  reveal: (key: string) => api.get<Record<string, string>>(`/settings/${key}/reveal`),
  /** Sends a real test email with the SAVED SMTP settings. */
  testEmail: (to: string) => api.post<{ ok: boolean; message: string; host: string; port: number; security: string }>("/settings/email/test", { to }),
  testSms: (mobile: string) => api.post<{ ok: boolean; message: string }>("/settings/sms/test", { mobile }),
};

export const notificationsApi = {
  list: () => api.get<Page<Notification>>("/notifications", { page_size: 20 }),
  unread: () => api.get<{ total: number; by_category: Record<string, number> }>("/notifications/unread-count"),
  send: (body: { title: string; body: string; target?: string; society_id?: number; resident_ids?: number[]; sms?: boolean }) =>
    api.post<{ recipients: number }>("/notifications/send", body),
};

export const activityApi = {
  list: (q: { entity?: string; entity_id?: number; society_id?: number; page?: number } = {}) => api.get<Page<ActivityLog>>("/activity-logs", { page_size: 20, ...q }),
};
