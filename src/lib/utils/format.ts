const inrFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹12,475 */
export const inr = (n: number | null | undefined) => (n == null ? "—" : `₹${inrFmt.format(Math.round(n))}`);

/** Compact Indian money: ₹18.6L, ₹44.2k, ₹1.2Cr, ₹899 */
export function inrShort(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const trim = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace(/\.?0+$/, "");
  if (abs >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (abs >= 1e5) return `₹${trim(n / 1e5)}L`;
  if (abs >= 1e3) return `₹${trim(n / 1e3)}k`;
  return `₹${Math.round(n)}`;
}

export const num = (n: number | null | undefined) => (n == null ? "—" : inrFmt.format(n));

const parse = (d: string | Date) => (d instanceof Date ? d : new Date(d.length === 10 ? `${d}T00:00:00` : d));

/** 12 Oct */
export const dayMonth = (d?: string | null) =>
  d ? parse(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";

/** 29 Sep 2026 */
export const fullDate = (d?: string | null) =>
  d ? parse(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** 9:14 PM */
export const time = (d?: string | null) =>
  d ? parse(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase() : "—";

/** Tuesday, 29 Sep 2026 */
export const longToday = () =>
  new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

/** "Today 9:14 PM", "Yesterday", "27 Sep" */
export function relativeDay(d?: string | null): string {
  if (!d) return "—";
  const date = parse(d);
  const today = new Date();
  const diff = Math.floor((startOf(today) - startOf(date)) / 86_400_000);
  if (diff === 0) return `Today ${time(d)}`;
  if (diff === 1) return "Yesterday";
  return dayMonth(d);
}

/** "25 min ago", "2h ago", "3d ago" */
export function ago(d?: string | null): string {
  if (!d) return "—";
  const mins = Math.max(0, Math.round((Date.now() - parse(d).getTime()) / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Whole days from now until d (negative if past). */
export const daysUntil = (d: string) => Math.ceil((parse(d).getTime() - Date.now()) / 86_400_000);

const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** yyyy-mm-dd in local time */
export const isoDate = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/** "AC", "H2O"-style tile text: initials of the first two words. */
export const initials = (name?: string | null, max = 2) =>
  (name ?? "?")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, max)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const titleCase = (s?: string | null) =>
  (s ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const sentence = (s?: string | null) => {
  const t = (s ?? "").replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const unitLabel = (wing?: string | null, unit?: string | null) => (wing && unit ? `${wing}-${unit}` : unit ?? "—");

export const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** 1.4 MB, 230 KB, 2.1 GB */
export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(n < 10 * 1024 ** 2 ? 1 : 0)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
