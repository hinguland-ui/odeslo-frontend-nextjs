import clsx from "clsx";
import type { ReactNode } from "react";
import { TONE, type Tone } from "@/lib/utils/tones";

interface ChipProps {
  active?: boolean;
  tone?: Tone;
  size?: "md" | "sm" | "xs";
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const SIZE = {
  md: "h-[38px] rounded-[19px] px-4 text-[13px]",
  sm: "h-[31px] rounded-[15.5px] px-3 text-[12px]",
  xs: "h-[29px] rounded-[14.5px] px-3 text-[12px]",
};

/** Filter pill: ink when active, mist otherwise (Figma chips). */
export function Chip({ active, tone, size = "md", onClick, children, className }: ChipProps) {
  const toned = tone && !active ? clsx(TONE[tone].bg, TONE[tone].fg, "font-semibold") : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex shrink-0 items-center whitespace-nowrap leading-4 transition",
        SIZE[size],
        active ? "bg-ink font-semibold text-white" : toned ?? clsx("bg-mist text-ink hover:bg-line", size === "md" ? "font-medium" : "font-semibold"),
        className,
      )}
    >
      {children}
    </button>
  );
}

export interface ChipOption<V extends string> {
  value: V;
  label: ReactNode;
  tone?: Tone;
}

export function ChipGroup<V extends string>({
  options,
  value,
  onChange,
  size,
  className,
}: {
  options: ChipOption<V>[];
  value: V;
  onChange: (v: V) => void;
  size?: ChipProps["size"];
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-wrap items-center gap-2", className)}>
      {options.map((o) => (
        <Chip key={o.value} size={size} tone={o.tone} active={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

/** Two-option pill switch with an inset ink thumb (e.g. Service / Product). */
export function Segmented<V extends string>({ options, value, onChange, compact }: { options: ChipOption<V>[]; value: V; onChange: (v: V) => void; compact?: boolean }) {
  return (
    <div className="inline-flex h-[39px] items-center gap-1 rounded-[19.5px] bg-mist p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "h-[31px] rounded-[15.5px] text-[12px] font-semibold leading-[15px] transition",
            compact ? "px-3" : "px-[18px]",
            o.value === value ? "bg-ink text-white" : "text-body hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
