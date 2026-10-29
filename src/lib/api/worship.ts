import { api } from "./client";

export type PlaceKind = "mandir" | "masjid" | "church" | "gurudwara" | "jain_temple" | "buddhist_vihar" | "other";

export interface PlaceTiming {
  label: string;
  time: string;
  note?: string | null;
}

export interface WorshipPlace {
  id: number;
  society_id: number;
  kind: PlaceKind;
  name: string;
  dedicated_to: string | null;
  description: string | null;
  address: string | null;
  contact: string | null;
  photos: string[];
  timings: PlaceTiming[];
  is_active: boolean;
  created_at: string;
}

export interface PlaceInput {
  kind: PlaceKind;
  name: string;
  dedicated_to?: string | null;
  description?: string | null;
  address?: string | null;
  contact?: string | null;
  timings: PlaceTiming[];
}

/** Places of worship kept by the society admin and shown to the residents of the society. */
export const worshipApi = {
  list: (kind?: string) => api.get<WorshipPlace[]>("/worship-places", { kind }),
  get: (id: number) => api.get<WorshipPlace>(`/worship-places/${id}`),
  create: (body: PlaceInput) => api.post<WorshipPlace>("/worship-places", body),
  update: (id: number, body: Partial<PlaceInput> & { is_active?: boolean }) => api.patch<WorshipPlace>(`/worship-places/${id}`, body),
  remove: (id: number) => api.del<void>(`/worship-places/${id}`),
  /** `replace` = path of a saved photo to swap: the new one takes its place and the old file is deleted. */
  addPhoto: (id: number, file: File, replace?: string) => {
    const fd = new FormData();
    fd.append("photo", file);
    return api.form<WorshipPlace>(`/worship-places/${id}/photos${replace ? `?replace=${encodeURIComponent(replace)}` : ""}`, fd);
  },
  removePhoto: (id: number, path: string) => api.del<WorshipPlace>(`/worship-places/${id}/photos?path=${encodeURIComponent(path)}`),
};
