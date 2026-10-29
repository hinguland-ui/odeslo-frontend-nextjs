/**
 * Pastel colour pairs used across the Figma screens.
 * Class strings are written out in full so Tailwind can see them.
 */
export type Tone = "blue" | "lilac" | "green" | "yellow" | "pink" | "peach" | "gray" | "dark";

export const TONE: Record<Tone, { bg: string; fg: string; dot: string; border: string }> = {
  blue: { bg: "bg-blue-bg", fg: "text-blue-fg", dot: "bg-blue-fg", border: "border-blue-line" },
  lilac: { bg: "bg-lilac-bg", fg: "text-lilac-fg", dot: "bg-lilac-fg", border: "border-lilac-line" },
  green: { bg: "bg-green-bg", fg: "text-green-fg", dot: "bg-green-fg", border: "border-green-bg" },
  yellow: { bg: "bg-yellow-bg", fg: "text-yellow-fg", dot: "bg-yellow-fg", border: "border-yellow-line" },
  pink: { bg: "bg-pink-bg", fg: "text-pink-fg", dot: "bg-pink-fg", border: "border-pink-bg" },
  peach: { bg: "bg-peach-bg", fg: "text-peach-fg", dot: "bg-peach-fg", border: "border-peach-bg" },
  gray: { bg: "bg-mist", fg: "text-body", dot: "bg-body", border: "border-line" },
  dark: { bg: "bg-ink", fg: "text-white", dot: "bg-white", border: "border-ink" },
};

const ROTATION: Tone[] = ["blue", "peach", "lilac", "green", "yellow", "pink"];

/** Stable tone for an avatar / tile based on an id or name. */
export function toneFor(key: string | number | null | undefined): Tone {
  const s = String(key ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ROTATION[h % ROTATION.length]!;
}

export const toneAt = (i: number): Tone => ROTATION[i % ROTATION.length]!;
