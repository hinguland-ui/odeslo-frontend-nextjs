"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { residentsApi } from "@/lib/api/residents";
import { societiesApi } from "@/lib/api/societies";
import { unitLabel } from "@/lib/utils/format";

/** id → name maps for societies and residents (list endpoints only return ids). */
export function useLookups() {
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societiesApi.list() });
  const residents = useQuery({ queryKey: ["residents", "all"], queryFn: () => residentsApi.list({ status: "" }) });

  return useMemo(() => {
    const societyName = new Map(societies.data?.items.map((s) => [s.id, s.name]));
    const resident = new Map(residents.data?.items.map((r) => [r.id, r]));
    return {
      society: (id?: number | null) => (id ? societyName.get(id) ?? `Society #${id}` : "Platform"),
      residentName: (id?: number | null) => (id ? resident.get(id)?.name ?? `Resident #${id}` : "—"),
      residentUnit: (id?: number | null) => {
        const r = id ? resident.get(id) : undefined;
        return r ? unitLabel(r.wing_name, r.unit_no) : "—";
      },
      societies: societies.data?.items ?? [],
    };
  }, [societies.data, residents.data]);
}
