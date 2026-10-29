"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { societiesApi } from "@/lib/api/societies";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: authApi.me, staleTime: 5 * 60_000 });
}

/** The logged-in society admin's society (with stats). */
export function useMySociety() {
  const me = useMe();
  const id = me.data?.society_id ?? undefined;
  return useQuery({
    queryKey: ["society", id],
    queryFn: () => societiesApi.get(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
