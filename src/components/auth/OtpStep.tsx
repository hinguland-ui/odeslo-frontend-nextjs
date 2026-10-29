"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { FlowHeader } from "./flow/FlowHeader";
import { OtpBoxes } from "./flow/OtpBoxes";

const RESEND_SECONDS = 30;

interface OtpStepProps {
  sentTo: string;
  devOtp?: string | null;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  step?: number;
  total?: number;
}

/** Step 3: six OTP boxes, auto-verify on the last digit, resend after a short countdown. */
export function OtpStep({ sentTo, devOtp, onVerify, onResend, onBack, step = 3, total = 3 }: OtpStepProps) {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const inFlight = useRef(false);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const verify = async (code: string) => {
    if (inFlight.current || code.length !== 6) return;
    inFlight.current = true;
    setBusy(true);
    setFailed(false);
    try {
      await onVerify(code);
    } catch {
      setFailed(true);
      setOtp("");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const resend = async () => {
    setOtp("");
    setFailed(false);
    setLeft(RESEND_SECONDS);
    await onResend();
  };

  return (
    <div>
      <FlowHeader
        step={step}
        total={total}
        onBack={onBack}
        title="Enter the"
        light="6-digit code."
        subtitle={<>Sent to <span className="font-semibold text-ink">{sentTo}</span>. It is valid for a few minutes.</>}
      />
      <OtpBoxes value={otp} onChange={(v) => { setOtp(v); setFailed(false); }} onComplete={verify} disabled={busy} error={failed} />
      {devOtp !== undefined && devOtp !== null && (
        <p className="mt-4 rounded-[14px] bg-lilac-bg px-3 py-2 text-[12px] font-medium text-lilac-fg">
          Dev mode: the code is printed in the backend terminal as “[SMS -&gt; mobile] …”.
        </p>
      )}
      <Button block size="lg" loading={busy} disabled={otp.length !== 6} onClick={() => verify(otp)} className="mt-5">
        Verify &amp; continue
      </Button>
      <p className="mt-4 text-center text-[12px] text-muted">
        Did not get it?{" "}
        {left > 0 ? (
          <span className="font-semibold text-ink">Resend in {left}s</span>
        ) : (
          <button type="button" onClick={resend} className="font-semibold text-lilac-fg hover:underline">Resend code</button>
        )}
      </p>
    </div>
  );
}
