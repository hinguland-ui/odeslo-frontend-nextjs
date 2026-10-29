import clsx from "clsx";
import type { ReactNode } from "react";
import { TONE, type Tone } from "@/lib/utils/tones";
import { statusLabel, statusTone } from "@/lib/utils/status";

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
}

/** 21px pill with a 6px dot (Figma status badge). `sm` is the 18px tag used on cards. */
export function Badge({ tone = "gray", dot = true, size = "md", className, children }: BadgeProps) {
  const t = TONE[tone];
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
        size === "md" ? "h-[21px] px-2.5 text-[11px] leading-[13px]" : "h-[18px] px-[9px] text-[10px] font-bold leading-3",
        t.bg,
        t.fg,
        className,
      )}
    >
      {dot && <span className={clsx("size-1.5 rounded-full", t.dot)} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, label, dot = true }: { status?: string | null; label?: string; dot?: boolean }) {
  return (
    <Badge tone={statusTone(status)} dot={dot}>
      {label ?? statusLabel(status)}
    </Badge>
  );
}
