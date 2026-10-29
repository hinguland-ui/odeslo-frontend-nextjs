"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrandLogo, BrandOnDark } from "@/components/brand/Brand";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AdminRole } from "@/lib/auth/session";
import { LoginFlow } from "./flow/LoginFlow";
import { roleOf } from "./flow/roles";
import { Check } from "lucide-react";

const POINTS = [
  { id: "resident" as const, tone: "bg-blue-bg text-blue-fg", title: "Residents", text: "Book group deals, pay maintenance, raise complaints." },
  { id: "partner" as const, tone: "bg-green-bg text-green-fg", title: "Vendors", text: "Win deals from societies and track jobs and earnings." },
  { id: "society_admin" as const, tone: "bg-peach-bg text-peach-fg", title: "Society admins", text: "Residents, billing, deals and staff in one place." },
];

export function LoginScreen() {
  const params = useSearchParams();
  const [stage, setStage] = useState<{ role: AdminRole; step: number } | null>(null);
  const wide = !!stage;
  const [error, setError] = useState(params.get("expired") ? "Your session expired. Please sign in again." : "");

  return (
    <div className="flex min-h-screen bg-white">
      <aside className={`deep relative hidden flex-col justify-between overflow-hidden bg-ink text-white transition-[width] duration-500 lg:flex ${wide ? "w-[30%] p-8" : "w-[46%] max-w-[620px] p-10"}`}>
        <BrandOnDark subtitle="Web portal" />

        {stage ? <OnboardingSteps stage={stage} /> : (
        <div>
          <h1 className={`${wide ? "text-[28px] leading-[34px]" : "text-[38px] leading-[44px]"} tracking-[-0.6px]`}>
            <span className="font-bold">One home for your society,</span> <span className="font-medium text-white/80">for everyone in it.</span>
          </h1>
          <div className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <div key={p.title} className="flex items-center gap-3 rounded-[18px] bg-night p-3.5">
                <span className={`grid size-10 shrink-0 place-items-center rounded-[12px] ${p.tone}`}>{roleOf(p.id).icon}</span>
                <div>
                  <p className="text-[14px] font-semibold leading-5">{p.title}</p>
                  <p className="text-[13px] leading-[18px] text-night-muted">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        <p className="text-[11px] text-night-count">© {new Date().getFullYear()} Odeslo · Society management platform</p>
        <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-violet/20 blur-3xl" />
      </aside>

      <main className={`relative flex flex-1 justify-center overflow-y-auto p-6 ${wide ? "items-start pt-10 lg:px-12" : "items-center"}`}>
        <ThemeToggle className="absolute right-4 top-4" />
        <div className={`w-full transition-[max-width] duration-500 ${wide ? "max-w-[640px]" : "max-w-[420px]"}`}>
          <BrandLogo height={wide ? 28 : 34} className={wide ? "mb-6" : "mb-8"} />
          {error && <p role="alert" className="mb-4 rounded-[14px] bg-pink-bg px-3 py-2.5 text-[12px] font-medium text-pink-fg">{error}</p>}
          <LoginFlow onError={setError} onStage={setStage} />
        </div>
      </main>
    </div>
  );
}

const STEP_NAMES: Record<string, string[]> = {
  resident: ["Choose your role", "Mobile number", "Verify OTP", "Find your society", "Where you live", "Contact & review"],
  partner: ["Choose your role", "Mobile number", "Verify OTP", "About you", "Your services", "Verification"],
};

/** Left panel during onboarding: a vertical stepper so people always know where they are. */
function OnboardingSteps({ stage }: { stage: { role: AdminRole; step: number } }) {
  const names = STEP_NAMES[stage.role] ?? STEP_NAMES.resident!;
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.9px] text-violet-soft">Create your account</p>
      <h1 className="mt-2 text-[26px] font-bold leading-[32px] tracking-[-0.4px]">Let’s get you set up</h1>
      <p className="mt-2 text-[13px] leading-5 text-night-muted">It takes about two minutes. Your progress is saved if you leave.</p>
      <ol className="mt-8 space-y-1">
        {names.map((n, i) => {
          const num = i + 1;
          const done = num < stage.step;
          const now = num === stage.step;
          return (
            <li key={n} className="relative flex items-center gap-3 py-2.5">
              {i < names.length - 1 && <span className={`absolute left-[13px] top-[38px] h-[calc(100%-14px)] w-px ${done ? "bg-violet" : "bg-night-line"}`} aria-hidden />}
              <span className={`relative grid size-[27px] shrink-0 place-items-center rounded-full text-[12px] font-bold ${done ? "bg-violet text-white" : now ? "bg-white text-ink ring-4 ring-violet/40" : "bg-night text-night-count"}`}>
                {done ? <Check size={15} strokeWidth={3} /> : num}
              </span>
              <span className={`text-[14px] ${now ? "font-semibold text-white" : done ? "text-night-muted" : "text-night-count"}`}>{n}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
