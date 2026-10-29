"use client";

import { BrandLogo, BrandOnDark } from "@/components/brand/Brand";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export interface NavItem {
  href: string;
  label: string;
  count?: number | null;
  /** Extra path prefixes that should also mark this item active. */
  match?: string[];
}

type Theme = "light" | "dark";

/** Brand header card: logo on the left, the panel's role as a small pill on the right. Stays fixed above the scrolling menu. */
export function SidebarBrand({ subtitle, theme }: { subtitle: string; theme: Theme }) {
  const dark = theme === "dark";
  return (
    <div className={clsx("mb-4 flex shrink-0 items-center justify-between gap-2 rounded-[18px] px-3.5 py-3", dark ? "bg-night" : "bg-white shadow-[0_1px_0_var(--color-line),0_6px_18px_-10px_rgba(28,28,34,0.25)]")}>
      {dark ? <BrandOnDark size={30} /> : <BrandLogo height={28} />}
      <span className={clsx("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-[12px] tracking-[0.6px]", dark ? "bg-violet text-white" : "bg-lilac-bg text-lilac-fg")}>
        {subtitle.replace(/ Admin$/, "")}
      </span>
    </div>
  );
}

/** 34px pill links; active = ink (light) or violet (dark). */
export function SidebarNav({ items, theme }: { items: NavItem[]; theme: Theme }) {
  const pathname = usePathname();
  const isActive = (item: NavItem) =>
    [item.href, ...(item.match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex h-[34px] items-center justify-between rounded-[17px] pl-3 pr-[11px] text-[13px] leading-4 transition",
              active
                ? clsx("font-semibold text-white", theme === "dark" ? "bg-violet" : "bg-ink")
                : clsx("font-medium", theme === "dark" ? "text-off hover:bg-night" : "text-ink hover:bg-mist"),
            )}
          >
            <span>{item.label}</span>
            {!!item.count && !active && (
              <span className={clsx("text-[11px] font-bold leading-[13px]", theme === "dark" ? "text-night-count" : "text-muted")}>
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
