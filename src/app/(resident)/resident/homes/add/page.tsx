"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { ResidentOnboarding, type Kind } from "@/components/auth/flow/ResidentOnboarding";
import { residentApi } from "@/lib/api/resident";

/** Add another flat (same society or a different one) under the same login. The flat's society admin approves it. */
export default function AddHomePage() {
  const router = useRouter();
  const toast = useToast();
  const me = useQuery({ queryKey: ["resident", "me"], queryFn: residentApi.me });
  const m = me.data;
  if (!m) return <Skeleton className="h-[420px] w-full max-w-[460px]" />;

  return (
    <div className="max-w-[460px]">
      <ResidentOnboarding
        mobile={m.mobile}
        token=""
        addHome
        onCancel={() => router.push("/resident/home")}
        onError={(msg) => msg && toast(msg, "error")}
        onRegistered={() => "/resident/home"}
        initial={{
          kind: (["owner", "tenant", "family"].includes(m.resident_type) ? m.resident_type : "owner") as Kind,
          name: m.name,
          email: m.email,
          ecName: m.emergency_contact_name,
          ecMobile: m.emergency_contact_mobile,
        }}
      />
    </div>
  );
}
