"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, EmptyState, Panel, Skeleton } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { finishLogin } from "@/components/auth/finishLogin";
import { ResidentOnboarding, type Kind } from "@/components/auth/flow/ResidentOnboarding";
import { isSignedIn } from "@/lib/auth/session";
import { residentApi } from "@/lib/api/resident";

/** A rejected resident fixes the details and applies again (uses their own login, no new OTP). */
export default function ResidentReapplyPage() {
  const router = useRouter();
  const toast = useToast();
  const home = useQuery({ queryKey: ["resident", "home"], queryFn: residentApi.home });
  const me = useQuery({ queryKey: ["resident", "me"], queryFn: residentApi.me });
  const m = me.data;
  const h = home.data;
  const signedIn = isSignedIn();

  if (me.isLoading || home.isLoading) return <Skeleton className="h-[420px] w-full max-w-[460px]" />;
  if (!m || !h || !signedIn || m.status !== "rejected")
    return (
      <Panel variant="soft" className="max-w-[460px]">
        <EmptyState title="Nothing to fix here" hint="Only a rejected request can be edited and sent again." action={<Button size="sm" href="/resident/home">Back to home</Button>} />
      </Panel>
    );

  return (
    <div className="max-w-[460px]">
      {m.rejection_reason && (
        <p className="mb-5 rounded-[16px] bg-pink-bg px-4 py-3 text-[12px] leading-4 text-pink-fg">
          <span className="font-bold">Your admin said:</span> {m.rejection_reason}
        </p>
      )}
      <ResidentOnboarding
        mobile={m.mobile}
        token="" /* empty: the login cookie is used */
        onCancel={() => router.push("/resident/home")}
        onError={(msg) => msg && toast(msg, "error")}
        onRegistered={(res) => finishLogin(res, "resident")}
        initial={{
          society: { id: h.society.id, code: h.society.code, name: h.society.name, area: h.society.area, city: h.society.city, lat: h.society.lat, lng: h.society.lng },
          wingId: m.wing_id,
          unitId: m.unit_id,
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
