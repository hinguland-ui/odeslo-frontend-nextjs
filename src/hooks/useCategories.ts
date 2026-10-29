"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi, type CategoryRow } from "@/lib/api/categories";
import { registerCategoryNames } from "@/lib/utils/categories";

/** Live category tree (main categories + their sub-categories) managed by the super admin. */
export function useCategories(includeInactive = false) {
  const q = useQuery({
    queryKey: ["categories", includeInactive ? "all" : "active"],
    queryFn: () => categoriesApi.list(includeInactive),
    staleTime: 60_000,
    select: (rows: CategoryRow[]) => {
      registerCategoryNames(rows); // keeps categoryOf() labels in step with renames
      return rows;
    },
  });
  const rows = q.data ?? [];
  const tops = rows.filter((r) => r.parent_id === null);
  return {
    rows,
    tops,
    keys: tops.map((t) => t.key),
    childrenOf: (key: string | number) => {
      const parent = tops.find((t) => t.key === key || t.id === key);
      return parent ? rows.filter((r) => r.parent_id === parent.id) : [];
    },
    isLoading: q.isLoading,
  };
}
