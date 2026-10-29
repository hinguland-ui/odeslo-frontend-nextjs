"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { residentApi } from "@/lib/api/resident";

/** The only pages a resident can open before the society admin approves them. */
const OPEN = ["/resident/home", "/resident/profile", "/resident/reapply"];

/**
 * Residents waiting for approval (or rejected) can only open Home and Profile. Any other address sends them back
 * to Home, and nothing of the other pages is drawn while we still do not know their status (no flash of the full app).
 */
export function ResidentGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const home = useQuery({ queryKey: ["resident", "home"], queryFn: residentApi.home });
  const open = OPEN.includes(pathname);
  const blocked = !!home.data?.limited_access && !open;

  useEffect(() => {
    if (blocked) router.replace("/resident/home");
  }, [blocked, router]);

  if (!open && (home.isLoading || blocked)) return <PageLoader label="One moment…" />;
  return <>{children}</>;
}
