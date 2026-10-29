import clsx from "clsx";
import type { PlaceKind } from "@/lib/api/worship";
import { kindInfo } from "@/lib/utils/worship";
import { TONE } from "@/lib/utils/tones";

/** Line icons drawn for each kind of place (24 x 24, they take the text colour). */
const PATHS: Record<PlaceKind, React.ReactNode> = {
  // Hindu temple: shikhara tower with a kalash and a flag
  mandir: (
    <>
      <path d="M3 21h18" />
      <path d="M5.5 21v-5h13v5" />
      <path d="M7.5 16v-2.5h9V16" />
      <path d="M8.5 13.5c0-3 1.6-5.2 3.5-7.5 1.9 2.3 3.5 4.5 3.5 7.5" />
      <path d="M12 6V3" />
      <path d="M12 3h3l-1 1 1 1h-3" />
      <path d="M10.7 21v-2.3a1.3 1.3 0 0 1 2.6 0V21" />
    </>
  ),
  // Masjid: dome, crescent and two minarets
  masjid: (
    <>
      <path d="M3 21h18" />
      <path d="M6.5 21v-6a5.5 5.5 0 0 1 11 0v6" />
      <path d="M12 9.5V7.5" />
      <path d="M13.4 5.3a1.7 1.7 0 1 1-2-1.9 1.4 1.4 0 0 0 2 1.9Z" />
      <path d="M3.5 21V11l1.25-1.8L6 11v10" />
      <path d="M18 21V11l1.25-1.8L20.5 11v10" />
      <path d="M10.5 21v-2.5a1.5 1.5 0 0 1 3 0V21" />
    </>
  ),
  // Church: cross, pitched roof, tower
  church: (
    <>
      <path d="M3 21h18" />
      <path d="M12 2v5M9.8 4h4.4" />
      <path d="M7.5 21V12.5L12 8.5l4.5 4V21" />
      <path d="M7.5 15H4.5V21M16.5 15h3V21" />
      <path d="M10.3 21v-3.2a1.7 1.7 0 0 1 3.4 0V21" />
    </>
  ),
  // Gurudwara: onion dome with the Nishan Sahib flag
  gurudwara: (
    <>
      <path d="M3 21h18" />
      <path d="M5.5 21v-7h13v7" />
      <path d="M7.5 14c0-2.6 1.7-4.4 4.5-6.5 2.8 2.1 4.5 3.9 4.5 6.5" />
      <path d="M12 7.5V2.5" />
      <path d="M12 2.5h3.5L14 4l1.5 1.5H12" />
      <path d="M9 21v-3.5a1 1 0 0 1 2 0V21M13 21v-3.5a1 1 0 0 1 2 0V21" />
    </>
  ),
  // Jain temple: stepped towers
  jain_temple: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21v-4h14v4" />
      <path d="M7 17v-3.5h10V17" />
      <path d="M9 13.5V10h6v3.5" />
      <path d="M12 10V6" />
      <path d="M12 6l1.6-1.6L12 2.8 10.4 4.4Z" />
      <path d="M10.8 21v-2a1.2 1.2 0 0 1 2.4 0v2" />
    </>
  ),
  // Buddhist vihar: stupa
  buddhist_vihar: (
    <>
      <path d="M3 21h18" />
      <path d="M5.5 21v-3h13v3" />
      <path d="M7.5 18c0-4.2 1.8-7 4.5-8.8 2.7 1.8 4.5 4.6 4.5 8.8" />
      <path d="M10.5 9.2h3V7h-3Z" />
      <path d="M12 7V4M10.6 4h2.8" />
    </>
  ),
  // Other: a heart
  other: <path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.5 2.5c0 5.7-7.5 10.3-7.5 10.3Z" />,
};

export function KindIcon({ kind, size = 22, className }: { kind: PlaceKind | string; size?: number; className?: string }) {
  const k = (kind in PATHS ? kind : "other") as PlaceKind;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {PATHS[k]}
    </svg>
  );
}

/** Round tinted tile with the icon, in the colour of the kind. */
export function KindTile({ kind, size = 44, className }: { kind: PlaceKind | string; size?: number; className?: string }) {
  const t = TONE[kindInfo(kind).tone];
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-[16px]", t.bg, t.fg, className)} style={{ width: size, height: size }}>
      <KindIcon kind={kind} size={Math.round(size * 0.55)} />
    </span>
  );
}
