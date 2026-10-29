import { api, type Page } from "./client";
import type { SocietyDeletePreview, Features, MaintenanceSettings, Society, SocietyAdmin, SocietyCreate, SocietyDetail, Unit, Wing } from "@/lib/types/society";

export const societiesApi = {
  list: (q: { status?: string; city?: string; q?: string; page?: number; page_size?: number } = {}) =>
    api.get<Page<Society>>("/societies", { page_size: 200, ...q }),
  get: (id: number) => api.get<SocietyDetail>(`/societies/${id}`),
  create: (body: SocietyCreate) => api.post<Society>("/societies", body),
  update: (id: number, body: Partial<Society>) => api.patch<Society>(`/societies/${id}`, body),
  setStatus: (id: number, status: string, reason?: string) => api.post<Society>(`/societies/${id}/status`, { status, reason }),
  setFeatures: (id: number, features: Features) => api.put<Society>(`/societies/${id}/features`, features),
  setMaintenance: (id: number, settings: MaintenanceSettings) =>
    api.put<Society>(`/societies/${id}/maintenance-settings`, settings),
  joinInfo: (id: number) => api.get<{ society_id: number; code: string; name: string; join_url: string; qr_payload: string }>(`/societies/${id}/join-info`),
  /** What deleting would remove and keep (super admin). */
  deletePreview: (id: number) => api.get<SocietyDeletePreview>(`/societies/${id}/delete-preview`),
  /** Permanently delete the society and its data. `confirm_code` must be the society code. */
  remove: (id: number, confirm_code: string, delete_media: boolean) =>
    api.post<SocietyDeletePreview & { files_removed: number }>(`/societies/${id}/delete`, { confirm_code, delete_media }),
  wings: (id: number) => api.get<Wing[]>(`/societies/${id}/wings`),
  /** All units of a society (follows pagination; the API caps a page at 200). */
  units: async (id: number, q: { wing_id?: number; occupancy_status?: string; q?: string } = {}): Promise<Page<Unit>> => {
    const first = await api.get<Page<Unit>>(`/societies/${id}/units`, { page_size: 200, ...q });
    const items = [...first.items];
    for (let page = 2; items.length < first.total; page++) {
      const next = await api.get<Page<Unit>>(`/societies/${id}/units`, { page_size: 200, page, ...q });
      if (!next.items.length) break;
      items.push(...next.items);
    }
    return { ...first, items };
  },
  addUnit: (id: number, body: { unit_no: string; wing_id: number; unit_type: string; floor?: number | null }) =>
    api.post<Unit>(`/societies/${id}/units`, body),
  bulkUnits: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.form<{ created: number; skipped: number; errors: string[] }>(`/societies/${id}/units/bulk-upload`, fd);
  },
  admins: (society_id?: number) => api.get<SocietyAdmin[]>("/society-admins", { society_id }),
};

export interface LocationRequest {
  id: number;
  society_id: number;
  society_name: string | null;
  society_code: string | null;
  old_lat: number;
  old_lng: number;
  old_address: string | null;
  new_lat: number;
  new_lng: number;
  new_address: string | null;
  new_area: string | null;
  new_city: string | null;
  new_state: string | null;
  new_pincode: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_at: string | null;
  decision_note: string | null;
  created_at: string;
}

/** A society admin asks to move the society's pin; the super admin approves or rejects. */
export const locationRequestsApi = {
  list: (status?: string) => api.get<LocationRequest[]>("/location-requests", { status }),
  create: (body: { lat: number; lng: number; address?: string; area?: string; city?: string; state?: string; pincode?: string; reason?: string }) =>
    api.post<LocationRequest>("/location-requests", body),
  cancel: (id: number) => api.post<LocationRequest>(`/location-requests/${id}/cancel`),
  approve: (id: number, note?: string) => api.post<LocationRequest>(`/location-requests/${id}/approve`, { note: note || null }),
  reject: (id: number, note: string) => api.post<LocationRequest>(`/location-requests/${id}/reject`, { note }),
};
