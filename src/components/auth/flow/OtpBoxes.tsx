"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

const LEN = 6;

/** Six separate digit boxes: auto-advance, backspace goes back, paste fills all, arrows move. */
export function OtpBoxes({
  value,
  onChange,
  onComplete,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LEN }, (_, i) => value[i] ?? "");

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(LEN - 1, i))]?.focus();

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, LEN);
    onChange(clean);
    if (clean.length === LEN) onComplete?.(clean);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time password">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) return;
            const next = value.slice(0, i) + v[v.length - 1] + value.slice(i + 1);
            commit(next);
            focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (d) onChange(value.slice(0, i) + value.slice(i + 1));
              else {
                onChange(value.slice(0, Math.max(0, i - 1)) + value.slice(i));
                focus(i - 1);
              }
            } else if (e.key === "ArrowLeft") focus(i - 1);
            else if (e.key === "ArrowRight") focus(i + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
            if (!text) return;
            commit(text);
            focus(text.length >= LEN ? LEN - 1 : text.length);
          }}
          className={clsx(
            "h-14 w-full min-w-0 rounded-[16px] bg-mist text-center text-[22px] font-bold text-ink outline-none transition focus:bg-white focus:ring-2 disabled:opacity-60",
            error ? "ring-2 ring-pink-fg/40" : d ? "ring-1 ring-ink/20 focus:ring-ink/40" : "focus:ring-ink/30",
          )}
        />
      ))}
    </div>
  );
}
