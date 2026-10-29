"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui";
import type { AdminRole } from "@/lib/auth/session";
import { FlowHeader } from "./FlowHeader";
import { roleOf } from "./roles";

/** Email + password for admins. Super admins get a 2FA code next; society admins sign in directly. */
export function CredentialsStep({
  role,
  email,
  password,
  onEmail,
  onPassword,
  onSubmit,
  onBack,
  onUseMobile,
  total,
}: {
  role: AdminRole;
  email: string;
  password: string;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onUseMobile: () => void;
  total: number;
}) {
  const [busy, setBusy] = useState(false);
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
        title="Sign in"
        light="with email."
        subtitle={role === "super_admin" ? "A one-time code is sent to your registered mobile after this." : `Signing in as ${roleOf(role).title.toLowerCase()}.`}
      />
      <div className="space-y-4">
        <Field label="Email"><Input autoFocus type="email" autoComplete="username" value={email} onChange={(e) => onEmail(e.target.value)} placeholder="you@society.in" /></Field>
        <Field label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={(e) => onPassword(e.target.value)} /></Field>
      </div>
      <Button type="submit" block size="lg" loading={busy} disabled={!email || !password} className="mt-5">
        {role === "super_admin" ? "Continue" : "Sign in"}
      </Button>
      <button type="button" onClick={onUseMobile} className="mt-4 w-full text-center text-[12px] font-semibold text-lilac-fg hover:underline">
        Use mobile OTP instead
      </button>
    </form>
  );
}
