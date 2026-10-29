"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { partnersApi } from "@/lib/api/deals";
import { staffApi } from "@/lib/api/ops";
import { worshipApi } from "@/lib/api/worship";
import { useMe, useMySociety } from "@/hooks/useMe";
import { initials, titleCase } from "@/lib/utils/format";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarBrand, SidebarNav, type NavItem } from "./SidebarNav";

export function SocietySidebar() {
  const me = useMe();
  const society = useMySociety();
  const dash = useQuery({ queryKey: ["dashboard", "society"], queryFn: dashboardApi.society, refetchInterval: 60_000 });
  const staff = useQuery({ queryKey: ["staff", "count"], queryFn: () => staffApi.list({ status: "active" }) });
  const vendors = useQuery({ queryKey: ["partners", "available", "all"], queryFn: () => partnersApi.available() });
  const places = useQuery({ queryKey: ["worship"], queryFn: () => worshipApi.list() });

  const d = dash.data;
  const items: NavItem[] = [
    { href: "/society/dashboard", label: "Dashboard" },
    { href: "/society/my-society", label: "My society" },
    { href: "/society/residents", label: "Residents", count: d?.residents.count },
    { href: "/society/approvals", label: "Approvals", count: d?.pending_approvals.count },
    { href: "/society/units", label: "Units", count: d?.units.total },
    { href: "/society/deals", label: "Group deals", count: d?.active_deals },
    { href: "/society/maintenance", label: "Maintenance" },
    { href: "/society/complaints", label: "Complaints", count: d?.open_complaints },
    { href: "/society/service-jobs", label: "Service jobs", count: d?.todays_service_jobs },
    { href: "/society/refunds", label: "Refunds", count: d?.pending_refunds },
    { href: "/society/vendors", label: "Vendors", count: vendors.data?.length },
    { href: "/society/staff", label: "Staff", count: staff.data?.total },
    { href: "/society/announcements", label: "Announcements" },
    { href: "/society/worship", label: "Religious places", count: places.data?.length },
  ];

  const s = society.data;
  return (
    <>
      <SidebarBrand subtitle="Society Admin" theme="light" />

      {/* only this middle part scrolls; logo above and user + Log out below stay in place */}
      <div className="scroll-thin -mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-3">

      <Link href="/society/my-society" className="mt-[18px] flex items-center gap-3 rounded-[18px] bg-peach-bg p-3 transition hover:brightness-[0.97]">
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white text-[14px] font-extrabold text-peach-fg">
          {initials(s?.name ?? "…", 2)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold leading-[18px] text-ink">{s?.name ?? "Loading…"}</span>
          <span className="mt-0.5 block truncate text-[11px] leading-[14px] text-body">
            {s ? `${s.stats.units} ${s.stats.units === 1 ? "flat" : "flats"} · ${s.stats.wings} ${s.stats.wings === 1 ? "wing" : "wings"}` : " "}
          </span>
          {s && <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-peach-fg">{s.code}</span>}
        </span>
      </Link>

      <div className="mt-[18px]">
        <SidebarNav items={items} theme="light" />
      </div>

      </div>

      <SidebarFooter name={me.data?.name} sub={titleCase(me.data?.profile.designation)} />
    </>
  );
}
