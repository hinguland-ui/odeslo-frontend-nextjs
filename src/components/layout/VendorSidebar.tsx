"use client";

import { useQuery } from "@tanstack/react-query";
import { vendorApi } from "@/lib/api/vendor";
import { useMe } from "@/hooks/useMe";
import { initials } from "@/lib/utils/format";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarBrand, SidebarNav, type NavItem } from "./SidebarNav";

export function VendorSidebar() {
  const me = useMe();
  const profile = useQuery({ queryKey: ["vendor", "profile"], queryFn: vendorApi.profile, staleTime: 60_000 });
  const today = useQuery({ queryKey: ["vendor", "jobs", "today"], queryFn: () => vendorApi.jobs("today"), refetchInterval: 60_000 });
  const active = useQuery({ queryKey: ["vendor", "jobs", "active"], queryFn: () => vendorApi.jobs("active"), refetchInterval: 60_000 });

  const unread = useQuery({ queryKey: ["vendor", "unread"], queryFn: vendorApi.unreadCount, refetchInterval: 60_000 });
  const opps = useQuery({ queryKey: ["vendor", "opportunities"], queryFn: vendorApi.opportunities, refetchInterval: 60_000 });

  const items: NavItem[] = [
    { href: "/vendor/dashboard", label: "Dashboard" },
    { href: "/vendor/jobs", label: "My jobs", count: active.data?.length ?? today.data?.length },
    { href: "/vendor/deals", label: "Deals", count: opps.data?.length },
    { href: "/vendor/earnings", label: "Earnings" },
    { href: "/vendor/reviews", label: "Reviews" },
    { href: "/vendor/notifications", label: "Notifications", count: unread.data?.total },
    { href: "/vendor/profile", label: "Profile & bank" },
  ];

  const p = profile.data;
  return (
    <>
      <SidebarBrand subtitle="Vendor" theme="light" />

      {/* only this middle part scrolls; logo above and user + Log out below stay in place */}
      <div className="scroll-thin -mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-3">

      <div className="mt-[18px] flex h-[50px] items-center gap-2.5 rounded-[14px] bg-green-bg px-2.5">
        <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-white text-[12px] font-bold text-green-fg">
          {initials(p?.business_name ?? p?.name ?? "…")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-4 text-ink">{p?.business_name ?? p?.name ?? "Loading…"}</p>
          <p className="truncate text-[11px] leading-[13px] text-muted">
            {p ? (p.rating_count ? `★ ${p.rating_avg.toFixed(1)} · ${p.rating_count} reviews` : "No reviews yet") : " "}
          </p>
        </div>
      </div>

      <div className="mt-[18px]">
        <SidebarNav items={items} theme="light" />
      </div>

      </div>

      <SidebarFooter name={me.data?.name} sub={me.data?.mobile} />
    </>
  );
}
