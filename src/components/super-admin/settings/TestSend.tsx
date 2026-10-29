"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { settingsApi } from "@/lib/api/ops";
import { Check, X } from "lucide-react";

const BOX = "flex h-11 min-w-0 flex-1 items-center rounded-[14px] bg-white px-3.5 ring-1 ring-line transition focus-within:ring-2 focus-within:ring-ink/25";
const INPUT = "min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-hint";

/** Type an address or number, press send: a real test goes out with the SAVED settings and the result is shown plainly. */
export function TestSend({ kind, dirty, loading }: { kind: "email" | "sms"; dirty: boolean; loading: boolean }) {
  const [to, setTo] = useState("");
  const isEmail = kind === "email";
  const valid = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim()) : /^\d{10}$/.test(to.replace(/\D/g, "").slice(-10)) && to.replace(/\D/g, "").length >= 10;
  const send = useAction(() => (isEmail ? settingsApi.testEmail(to.trim()) : settingsApi.testSms(to.replace(/\D/g, "").slice(-10))), {});
  const result = send.data;

  return (
    <div className="mt-3 rounded-[16px] bg-white/70 p-3">
      <p className="mb-2 text-[12px] font-bold text-ink">{isEmail ? "Send a test email" : "Send a test SMS"}</p>
      <div className="flex flex-wrap items-center gap-2">
        <div className={BOX}>
          <input
            type={isEmail ? "email" : "tel"}
            inputMode={isEmail ? "email" : "numeric"}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && valid && !dirty && send.mutate(undefined)}
            placeholder={isEmail ? "you@example.com" : "98250 12345"}
            className={INPUT}
          />
        </div>
        <Button size="sm" variant="dark" loading={send.isPending} disabled={!valid || dirty || loading} onClick={() => send.mutate(undefined)}>
          {isEmail ? "Send test email" : "Send test SMS"}
        </Button>
      </div>
      {dirty && <p className="mt-1.5 text-[11px] text-body">Save your changes first. The test uses the saved settings.</p>}
      {result && (
        <p className={`mt-2 rounded-[12px] bg-white px-3 py-2 text-[12px] font-medium leading-4 ${result.ok ? "text-green-fg" : "text-pink-fg"}`}>
          {result.ok ? <Check size={14} strokeWidth={3} className="mr-1 inline" /> : <X size={14} strokeWidth={3} className="mr-1 inline" />}{result.message}
        </p>
      )}
    </div>
  );
}
