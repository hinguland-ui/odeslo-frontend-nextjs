"use client";

import { FullScreenLoader } from "@/components/ui/Preloader";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api/auth";
import { onboardingApi, type Draft } from "@/lib/api/onboarding";
import { isAdminRole, type AdminRole } from "@/lib/auth/session";
import type { AuthResponse } from "@/lib/types/auth";
import { errorText, finishLogin } from "../finishLogin";
import { OtpStep } from "../OtpStep";
import { SetPasswordStep } from "../SetPasswordStep";
import { CredentialsStep } from "./CredentialsStep";
import { FlowHeader } from "./FlowHeader";
import { PhoneStep } from "./PhoneStep";
import { ResidentOnboarding } from "./ResidentOnboarding";
import { RoleStep } from "./RoleStep";
import { VendorOnboarding } from "./VendorOnboarding";
import { clearResume, loadResume, saveResume } from "./resume";
import { ROLES, SUPPORTS_PASSWORD } from "./roles";

const SLUG: Record<AdminRole, string> = { resident: "resident", partner: "vendor", society_admin: "society-admin", super_admin: "super-admin" };
const ROLE_OF_SLUG = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [v, k])) as Record<string, AdminRole>;
const ONBOARD_SLUG: Record<string, string[]> = { resident: ["society", "address", "review"], partner: ["profile", "services", "documents"] };

/** Clean, shareable address for each step, e.g. /login/resident/verify or /login/vendor/onboarding/services. */
function stepPath(step: Step, role: AdminRole | null, method: "otp" | "password", onboardStep: number) {
  if (!role || step === "role") return "/login";
  const base = `/login/${SLUG[role]}`;
  if (step === "phone") return base;
  if (step === "credentials") return `${base}/password`;
  if (step === "otp") return `${base}/verify`;
  if (step === "set-password") return `${base}/set-password`;
  const name = ONBOARD_SLUG[role]?.[Math.max(0, onboardStep - 1)] ?? "start";
  return `${base}/onboarding/${name}`;
}

type Step = "role" | "phone" | "credentials" | "otp" | "set-password" | "onboard";
type Method = "otp" | "password";

const rolePrefix = (next: string | null): AdminRole | null =>
  !next ? null : next.startsWith("/admin") ? "super_admin" : next.startsWith("/vendor") ? "partner" : next.startsWith("/resident") ? "resident" : next.startsWith("/society") ? "society_admin" : null;

/**
 * Sign-in in four taps: choose who you are -> mobile number (+91) -> 6 OTP boxes -> home.
 * New residents and vendors continue into a short onboarding wizard after the code.
 */
export function LoginFlow({ onError, onStage }: { onError: (msg: string) => void; onStage?: (s: { role: AdminRole; step: number } | null) => void }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const slugRole = ROLE_OF_SLUG[pathname.split("/")[2] ?? ""] ?? null;
  const preset = rolePrefix(params.get("next")) ?? slugRole;
  const [role, setRole] = useState<AdminRole | null>(preset);
  const [step, setStep] = useState<Step>(preset ? "phone" : "role");
  const [method, setMethod] = useState<Method>("otp");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [regToken, setRegToken] = useState("");
  const [nextPath, setNextPath] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  // an onboarding address (/login/resident/onboarding/...) is being restored after a refresh: wait before showing anything
  const [restoring, setRestoring] = useState(() => pathname.includes("/onboarding"));

  // A refresh in the middle of sign-up carries on where the person stopped instead of going back to the OTP page.
  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = loadResume(slugRole);
      const d = saved ? await onboardingApi.get(saved.role as "resident" | "partner", saved.token).catch(() => ({ step: 0, data: {} })) : null;
      if (!alive) return;
      if (saved && d) {
        setRole(saved.role);
        setMobile(saved.mobile);
        setRegToken(saved.token);
        setDraft(d);
        setStep("onboard");
      }
      setRestoring(false);
    })();
    return () => { alive = false; };
    // runs once, on the first load of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the address bar in step with the screen, and let the page widen the form during onboarding
  useEffect(() => {
    const path = stepPath(step, role, method, onboardStep);
    if (window.location.pathname !== path) window.history.replaceState(window.history.state, "", path + window.location.search);
  }, [step, role, method, onboardStep]);
  useEffect(() => { onStage?.(step === "onboard" && role ? { role, step: 3 + onboardStep } : null); }, [step, role, onboardStep, onStage]);
  const go = (to: string) => {
    clearResume();
    setLeaving(true);
    window.location.href = to;
  };

  const back = (to: Step) => { onError(""); if (to === "role" || to === "phone") clearResume(); setStep(to); };
  const guard = async (fn: () => Promise<void>) => {
    try { onError(""); await fn(); } catch (e) { onError(errorText(e)); throw e; }
  };

  const done = (res: AuthResponse, r: AdminRole) => {
    const to = finishLogin(res, r);
    if (r === "society_admin" && res.must_set_password) { setNextPath(to); setStep("set-password"); }
    else go(to);
  };

  const pickRole = (r: AdminRole) => { onError(""); setRole(r); setMethod("otp"); setStep("phone"); };

  const sendCode = async () => {
    const r = role!;
    if (method === "otp") {
      const res = await authApi.sendOtp(mobile.trim(), r);
      setDevOtp(res.dev_otp ?? null);
      setStep("otp");
    } else if (r === "super_admin") {
      const res = await authApi.superAdminLogin(email.trim(), password);
      setDevOtp(res.dev_otp ?? null);
      setStep("otp");
    } else {
      done(await authApi.societyAdminPassword(email.trim(), password), r);
    }
  };

  const verify = async (otp: string) => {
    const r = role!;
    const res =
      method === "password" && r === "super_admin"
        ? await authApi.superAdminVerify(email.trim(), otp)
        : await authApi.verifyOtp(mobile.trim(), otp, r);
    if (res.registration_required && res.registration_token && (r === "resident" || r === "partner")) {
      setRegToken(res.registration_token);
      saveResume({ role: r, mobile: mobile.trim(), token: res.registration_token });
      // a person who came back after closing the page continues where they stopped
      setDraft(await onboardingApi.get(r, res.registration_token).catch(() => ({ step: 0, data: {} })));
      setStep("onboard");
      return;
    }
    done(res, r);
  };

  // new residents and vendors have 3 more steps after the code: Step 1..6
  const flowTotal = ROLES.find((x) => x.id === role)?.selfSignup ? 6 : 3;
  const saveDraft = role === "resident" || role === "partner" ? (s: number, data: Record<string, unknown>) => { onboardingApi.save(role, s, data, regToken).catch(() => {}); } : undefined;

  if (leaving) return <FullScreenLoader variant="wordmark" label="Signing you in…" />;
  if (restoring) return <div className="grid min-h-[240px] place-items-center text-[13px] text-muted">Picking up where you left off…</div>;

  if (step === "role" || !role) return <RoleStep onPick={pickRole} />;

  if (step === "phone")
    return (
      <PhoneStep
        role={role}
        mobile={mobile}
        onMobile={setMobile}
        total={flowTotal}
        onBack={() => back("role")}
        onSubmit={() => guard(sendCode).catch(() => {})}
        onUsePassword={SUPPORTS_PASSWORD[role] ? () => { setMethod("password"); back("credentials"); } : undefined}
      />
    );

  if (step === "credentials")
    return (
      <CredentialsStep
        role={role}
        email={email}
        password={password}
        onEmail={setEmail}
        onPassword={setPassword}
        total={role === "super_admin" ? 3 : 2}
        onBack={() => back("role")}
        onUseMobile={() => { setMethod("otp"); back("phone"); }}
        onSubmit={() => guard(sendCode).catch(() => {})}
      />
    );

  if (step === "otp")
    return (
      <OtpStep
        step={3}
        total={method === "password" ? 3 : flowTotal}
        sentTo={method === "password" ? "your registered mobile" : `+91 ${mobile}`}
        devOtp={devOtp}
        onBack={() => back(method === "password" ? "credentials" : "phone")}
        onResend={() => guard(sendCode).catch(() => {})}
        onVerify={async (otp) => { await guard(() => verify(otp)); }}
      />
    );

  if (step === "set-password")
    return (
      <div>
        <FlowHeader title="Set a" light="password." />
        <SetPasswordStep onDone={() => go(nextPath)} />
      </div>
    );

  // onboarding for brand-new residents / vendors
  return role === "resident" ? (
    <ResidentOnboarding
      key={draft ? "d" : "n"}
      mobile={mobile}
      token={regToken}
      resume={draft && draft.step > 0 ? draft : undefined}
      onProgress={saveDraft}
      stepBase={3}
      stepTotal={6}
      onStep={setOnboardStep}
      onCancel={() => back("phone")}
      onError={onError}
      onRegistered={(res) => {
        if (!isAdminRole(res.user_type)) throw new Error("Could not start your session. Please sign in again.");
        clearResume(); // signed up: nothing left to resume
        return finishLogin(res, "resident");
      }}
    />
  ) : (
    <VendorOnboarding key={draft ? "d" : "n"} mobile={mobile} token={regToken} resume={draft && draft.step > 0 ? draft : undefined} onProgress={saveDraft} stepBase={3} stepTotal={6} onStep={setOnboardStep} onCancel={() => back("phone")} onError={onError} onBackToSignIn={() => { clearResume(); setMobile(""); back("role"); }} />
  );
}
