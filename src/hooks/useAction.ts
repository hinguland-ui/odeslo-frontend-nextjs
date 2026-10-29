"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/providers/ToastProvider";

interface Options<R> {
  /** Toast shown on success (string or builder). */
  success?: string | ((result: R) => string);
  /** Query-key prefixes to refetch afterwards, e.g. [["residents"], ["dashboard"]]. */
  invalidate?: unknown[][];
  onSuccess?: (result: R) => void;
}

/** useMutation + success/error toast + cache invalidation. */
export function useAction<A, R>(fn: (args: A) => Promise<R>, opts: Options<R> = {}) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result) => {
      await Promise.all((opts.invalidate ?? []).map((queryKey) => qc.invalidateQueries({ queryKey })));
      // data is cached for minutes now, so anything changed here must not be served stale elsewhere: mark every cache entry stale
      // (screens on display refetch now; others refetch when you open them)
      qc.invalidateQueries({ predicate: (q) => !["chat", "job-location"].includes(String(q.queryKey[0])) });
      if (opts.success) toast(typeof opts.success === "function" ? opts.success(result) : opts.success);
      opts.onSuccess?.(result);
    },
    onError: (err) => toast(err instanceof Error ? err.message : "Action failed", "error"),
  });
}
