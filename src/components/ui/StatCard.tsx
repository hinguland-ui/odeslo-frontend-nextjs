import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";
import { TONE, type Tone } from "@/lib/utils/tones";

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  href?: string;
  /** "lg" = 102px dashboard card (26px value), "md" = 95px, "sm" = 77px without sub line. */
  size?: "lg" | "md" | "sm";
  loading?: boolean;
  className?: string;
}

/** Pastel KPI card from the dashboards and list headers. */
export function StatCard({ label, value, sub, tone = "blue", href, size = "md", loading, className }: StatCardProps) {
  const body = (
    <>
      <p className="text-[12px] font-semibold leading-[15px] text-body">{label}</p>
      <p className={clsx("mt-[5px] font-bold text-ink", size === "lg" ? "text-[26px] leading-[33px]" : "text-[24px] leading-[30px]")}>
        {loading ? <span className="inline-block h-6 w-14 animate-pulse rounded-md bg-white/60" /> : value}
      </p>
      {sub != null && size !== "sm" && <p className="mt-[5px] truncate text-[11px] leading-[13px] text-body">{sub}</p>}
    </>
  );
  const cls = clsx(
    "block rounded-[20px] p-[14px]",
    TONE[tone].bg,
    size === "lg" ? "min-h-[102px]" : size === "md" ? "min-h-[95px]" : "min-h-[77px]",
    href && "transition hover:brightness-[0.98] hover:ring-1 hover:ring-black/5",
    className,
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** White mini card used inside soft panels (MRP / Location / Requested …). */
export function MiniStat({ label, value, className, valueClass }: { label: string; value: ReactNode; className?: string; valueClass?: string }) {
  return (
    <div className={clsx("rounded-[14px] bg-white px-3 py-2.5", className)}>
      <p className="text-[11px] leading-[13px] text-muted">{label}</p>
      <p className={clsx("mt-0.5 text-[16px] font-bold leading-[21px] text-ink", valueClass)}>{value}</p>
    </div>
  );
}
