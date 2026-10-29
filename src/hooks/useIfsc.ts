"use client";

import { useQuery } from "@tanstack/react-query";

export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export interface IfscInfo { BANK: string; BRANCH: string; CITY: string; STATE: string; ADDRESS: string; MICR?: string }

/** Looks up bank and branch for an IFSC code (free public service by Razorpay, no key needed). */
export function useIfsc(code: string) {
  const valid = IFSC_RE.test(code);
  return useQuery({
    queryKey: ["ifsc", code],
    enabled: valid,
    staleTime: 24 * 3600_000,
    retry: false,
    queryFn: async (): Promise<IfscInfo | null> => {
      const res = await fetch(`https://ifsc.razorpay.com/${code}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Bank lookup is not available right now");
      return res.json();
    },
  });
}
