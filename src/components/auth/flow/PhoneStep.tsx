"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import type { AdminRole } from "@/lib/auth/session";
import { FlowHeader } from "./FlowHeader";
import { roleOf, SUPPORTS_PASSWORD } from "./roles";

function IndiaFlag() {
  return (
    <svg viewBox="0 0 24 16" width="24" height="16" className="shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10" aria-label="India">
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.33" fill="#ff9933" />
      <rect y="10.67" width="24" height="5.33" fill="#138808" />
      <circle cx="12" cy="8" r="2.1" fill="none" stroke="#000080" strokeWidth="0.7" />
    </svg>
  );
}

/** Step 2: mobile number with +91 (India) already set. */
export function PhoneStep({
  role,
  mobile,
  onMobile,
  onSubmit,
  onBack,
  onUsePassword,
  total,
}: {
  role: AdminRole;
  mobile: string;
  onMobile: (v: string) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onUsePassword?: () => void;
  total: number;
}) {
  const [busy, setBusy] = useState(false);
  const r = roleOf(role);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <FlowHeader
        step={2}
        total={total}
        onBack={onBack}
        title="Enter your"
        light="mobile number."
        subtitle={r.selfSignup ? `Signing in as ${r.title.toLowerCase()}. New here? We will set up your account after the code.` : `Signing in as ${r.title.toLowerCase()}. Use the number registered with Odeslo.`}
      />
      <Field label="Mobile number">
        <div className="flex h-12 items-center gap-2.5 rounded-[16px] bg-mist px-3.5 ring-ink/10 focus-within:ring-2">
          <IndiaFlag />
          <span className="text-[14px] font-bold text-ink">+91</span>
          <span className="h-5 w-px bg-line" aria-hidden />
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={mobile}
            onChange={(e) => onMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="98765 43210"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-semibold tracking-wide text-ink outline-none placeholder:font-medium placeholder:text-hint"
          />
        </div>
      </Field>
      <Button type="submit" block size="lg" loading={busy} disabled={mobile.length !== 10} className="mt-5">
        Send OTP
      </Button>
      {SUPPORTS_PASSWORD[role] && onUsePassword && (
        <button type="button" onClick={onUsePassword} className="mt-4 w-full text-center text-[12px] font-semibold text-lilac-fg hover:underline">
          Use email &amp; password instead
        </button>
      )}
    </form>
  );
}
