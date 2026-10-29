import type { PlaceKind } from "@/lib/api/worship";
import type { Tone } from "./tones";

export interface KindInfo {
  value: PlaceKind;
  label: string;
  /** What the name field is called for this kind of place. */
  nameHint: string;
  /** "Dedicated to" is a deity for a mandir, a denomination for a church... */
  dedicatedLabel: string;
  dedicatedHint: string;
  tone: Tone;
  /** Timing names offered as one-tap suggestions. */
  timings: string[];
}

export const KINDS: KindInfo[] = [
  { value: "mandir", label: "Mandir", nameHint: "Shri Hanuman Mandir", dedicatedLabel: "Deity", dedicatedHint: "Hanuman ji, Shiv ji, Ganesh ji...", tone: "peach", timings: ["Morning aarti", "Evening aarti", "Bhajan", "Satsang", "Darshan"] },
  { value: "masjid", label: "Masjid", nameHint: "Noor Masjid", dedicatedLabel: "Imam / committee", dedicatedHint: "Imam sahab's name", tone: "green", timings: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jummah"] },
  { value: "church", label: "Church", nameHint: "St. Mary's Church", dedicatedLabel: "Denomination / Father", dedicatedHint: "Catholic, CSI, Father John...", tone: "blue", timings: ["Sunday mass", "Weekday mass", "Prayer meeting", "Confession"] },
  { value: "gurudwara", label: "Gurudwara", nameHint: "Gurudwara Sahib", dedicatedLabel: "Granthi / committee", dedicatedHint: "Granthi ji's name", tone: "yellow", timings: ["Nitnem", "Kirtan", "Ardas", "Langar"] },
  { value: "jain_temple", label: "Jain temple", nameHint: "Shri Parshwanath Jain Mandir", dedicatedLabel: "Tirthankar", dedicatedHint: "Parshwanath, Mahavir...", tone: "lilac", timings: ["Darshan", "Pooja", "Aarti", "Pravachan"] },
  { value: "buddhist_vihar", label: "Buddhist vihar", nameHint: "Buddha Vihar", dedicatedLabel: "Monk / committee", dedicatedHint: "Bhante's name", tone: "pink", timings: ["Morning prayer", "Evening prayer", "Meditation", "Dhamma talk"] },
  { value: "other", label: "Other", nameHint: "Name of the place", dedicatedLabel: "Dedicated to", dedicatedHint: "Optional", tone: "gray", timings: ["Prayer", "Open", "Close"] },
];

export const kindInfo = (k: string): KindInfo => KINDS.find((x) => x.value === k) ?? KINDS[KINDS.length - 1]!;

/** "06:30" (what a time input gives) -> "6:30 AM" (what is stored and shown). */
export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return "";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** "6:30 AM" -> "06:30" for a time input ("" when it is not a clock time). */
export function to24h(t: string): string {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t.trim());
  if (!m) return "";
  const h = (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0);
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}
