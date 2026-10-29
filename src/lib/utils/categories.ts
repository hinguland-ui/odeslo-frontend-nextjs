import type { Tone } from "./tones";
import { titleCase } from "./format";

/** Deal / service categories (backend ServiceCategory) with the tile text + tone used in Figma. */
export const CATEGORY: Record<string, { label: string; abbr: string; tone: Tone }> = {
  ac: { label: "AC & appliances", abbr: "AC", tone: "blue" },
  plumbing: { label: "Plumbing", abbr: "PLM", tone: "lilac" },
  electrical: { label: "Electrical", abbr: "ELC", tone: "yellow" },
  pest_control: { label: "Pest control", abbr: "PEST", tone: "peach" },
  cleaning: { label: "Cleaning", abbr: "CLN", tone: "lilac" },
  carpentry: { label: "Carpentry", abbr: "CRP", tone: "peach" },
  painting: { label: "Painting", abbr: "PNT", tone: "pink" },
  appliance_repair: { label: "Appliance repair", abbr: "APL", tone: "blue" },
  water_tank_cleaning: { label: "Water tank", abbr: "H2O", tone: "green" },
  other: { label: "Other", abbr: "OTH", tone: "gray" },
};

/** Names of categories and sub-categories as saved by the super admin (filled by useCategories). */
const names = new Map<string, string>();
export function registerCategoryNames(rows: { key: string; name: string }[]) {
  rows.forEach((r) => names.set(r.key, r.name));
}
const ROTATION: Tone[] = ["blue", "peach", "lilac", "green", "yellow", "pink"];

export const categoryOf = (key?: string | null) => {
  const known = CATEGORY[key ?? ""];
  const label = names.get(key ?? "") ?? known?.label ?? titleCase(key);
  if (known) return { ...known, label };
  let h = 0;
  for (const ch of key ?? "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { label, abbr: (label || "?").replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "?", tone: ROTATION[h % ROTATION.length]! };
};

/** Built-in keys only. Screens that list categories should use useCategories() so new ones appear. */
export const CATEGORY_KEYS = Object.keys(CATEGORY);

export const STAFF_TYPES = ["guard", "housekeeping", "plumber", "electrician", "gardener", "other"] as const;
export const COMPLAINT_CATEGORIES = ["plumbing", "electrical", "lift", "security", "cleanliness", "parking", "water", "noise", "other"] as const;
