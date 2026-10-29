import { api } from "./client";

export interface CategoryRow {
  id: number;
  key: string;
  name: string;
  parent_id: number | null;
  sort_order: number;
  active: boolean;
  deal_count: number;
  vendor_count: number;
}

export const categoriesApi = {
  list: (includeInactive = false) => api.get<CategoryRow[]>("/categories", { include_inactive: includeInactive }),
  create: (body: { name: string; parent_id?: number | null }) => api.post<CategoryRow>("/categories", body),
  update: (id: number, body: { name?: string; active?: boolean; sort_order?: number }) => api.patch<CategoryRow>(`/categories/${id}`, body),
  reorder: (ids: number[]) => api.post<void>("/categories/reorder", { ids }),
  remove: (id: number) => api.del<void>(`/categories/${id}`),
};
