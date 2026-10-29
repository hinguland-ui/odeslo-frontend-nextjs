import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { TONE, type Tone } from "@/lib/utils/tones";

type Variant = "outline" | "soft" | "dark" | "tone";

interface PanelProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  tone?: Tone;
  padded?: boolean;
  as?: "section" | "div" | "aside" | "article";
}

/** Rounded 24px container: outline (white + border), soft (#f6f6f8), dark (ink) or pastel tone. */
export function Panel({ variant = "outline", tone, padded = true, as: Tag = "section", className, children, ...rest }: PanelProps) {
  return (
    <Tag
      className={clsx(
        "rounded-[24px]",
        variant === "outline" && "border border-line bg-white",
        variant === "soft" && "bg-panel",
        variant === "dark" && "deep bg-ink text-white",
        variant === "tone" && TONE[tone ?? "blue"].bg,
        padded && "p-[18px]",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** "Live group deals ........ All deals" heading row. */
export function PanelTitle({ children, aside, className }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={clsx("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-[15px] font-bold leading-[19px] text-ink">{children}</h2>
      {aside && <div className="text-[12px] leading-[15px] text-muted">{aside}</div>}
    </div>
  );
}

/** 11px bold uppercase label: "PENDING APPROVALS · 4". */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("text-[11px] font-bold uppercase leading-[13px] tracking-[0.88px]", className)}>{children}</p>;
}

/** Coloured note strip (e.g. "Society admins can lower tier prices…"). */
export function Note({ tone = "lilac", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-[14px] px-3 py-2.5 text-[12px] font-medium leading-[15px]", TONE[tone].bg, TONE[tone].fg, className)}>
      {children}
    </div>
  );
}

/** Label / value line used in detail asides. */
export function KeyValue({ label, value, valueClass, className }: { label: ReactNode; value: ReactNode; valueClass?: string; className?: string }) {
  return (
    <div className={clsx("flex items-center justify-between gap-3 text-[12px] leading-[15px]", className)}>
      <span className="text-body">{label}</span>
      <span className={clsx("text-right font-bold text-ink", valueClass)}>{value}</span>
    </div>
  );
}

/** Thin progress bar (108×6 in the deals table). */
export function Progress({ value, max, className, barClass = "bg-ink", trackClass = "bg-mist" }: { value: number; max: number; className?: string; barClass?: string; trackClass?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={clsx("h-1.5 overflow-hidden rounded-full", trackClass, className)}>
      <div className={clsx("h-full rounded-full transition-all", barClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}
