"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { errorText } from "./finishLogin";

/** First login of a society admin: the backend asks them to set a password (they can skip). */
export function SetPasswordStep({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      await authApi.setPassword(pw);
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[13px] leading-[18px] text-body">
        Set a password so you can also sign in with your email next time.
      </p>
      <Field label="New password">
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
      </Field>
      <Field label="Confirm password">
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      {error && <p className="text-[12px] font-medium text-pink-fg">{error}</p>}
      <Button type="submit" block size="lg" loading={busy}>
        Save password
      </Button>
      <button type="button" onClick={onDone} className="w-full text-center text-[12px] font-semibold text-muted hover:text-ink">
        Skip for now
      </button>
    </form>
  );
}
