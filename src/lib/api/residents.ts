import { api, type Page } from "./client";
import type { Resident, ResidentDetail } from "@/lib/types/resident";

export interface ResidentEdit {
  name?: string;
  email?: string | null;
  resident_type?: "owner" | "tenant" | "family";
  wing_id?: number;
  unit_id?: number;
  emergency_contact_name?: string | null;
  emergency_contact_mobile?: string | null;
}

export const residentsApi = {
  list: (q: { status?: string; resident_type?: string; wing_id?: number; q?: string; society_id?: number; page?: number } = {}) =>
    api.get<Page<Resident>>("/residents", { page_size: 200, ...q }),
  pending: () => api.get<Page<Resident>>("/residents/pending", { page_size: 200 }),
  get: (id: number) => api.get<ResidentDetail>(`/residents/${id}`),
  /** Society admin corrects a registration (name, email, flat, type, emergency contact) before approving. */
  update: (id: number, body: ResidentEdit) => api.patch<Resident>(`/residents/${id}`, body),
  approve: (id: number) => api.post<Resident>(`/residents/${id}/approve`),
  reject: (id: number, reason: string) => api.post<Resident>(`/residents/${id}/reject`, { reason }),
  deactivate: (id: number) => api.post<Resident>(`/residents/${id}/deactivate`),
  reactivate: (id: number) => api.post<Resident>(`/residents/${id}/reactivate`),
  exportCsv: (status?: string) => api.download("/residents/export", { status }, "residents.csv"),
};
