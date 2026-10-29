import clsx from "clsx";
import { TONE, toneFor, type Tone } from "@/lib/utils/tones";
import { initials } from "@/lib/utils/format";

interface AvatarProps {
  name?: string | null;
  /** Text shown instead of initials (e.g. "AC", "H2O"). */
  label?: string;
  tone?: Tone;
  size?: number;
  shape?: "circle" | "rounded";
  className?: string;
}

/** Pastel initials tile. Rounded = 10px radius squares used for vendors / deals. */
export function Avatar({ name, label, tone, size = 32, shape = "circle", className }: AvatarProps) {
  const t = TONE[tone ?? toneFor(name)];
  const text = label ?? initials(name, 1);
  const radius = shape === "circle" ? size / 2 : size >= 48 ? 14 : size >= 34 ? 12 : 10;
  const font = size >= 48 ? 18 : text.length > 2 ? 10 : 12;
  return (
    <span
      className={clsx("grid shrink-0 place-items-center font-bold", t.bg, t.fg, className)}
      style={{ width: size, height: size, borderRadius: radius, fontSize: font }}
    >
      {text}
    </span>
  );
}
