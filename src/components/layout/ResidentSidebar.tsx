"use client";

import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/hooks/useMe";
import { residentApi } from "@/lib/api/resident";
import { titleCase } from "@/lib/utils/format";
import { HomeSwitcher } from "@/components/resident/HomeSwitcher";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarBrand, SidebarNav, type NavItem } from "./SidebarNav";

export function ResidentSidebar() {
  const me = useMe();
  const home = useQuery({ queryKey: ["resident", "home"], queryFn: residentApi.home, refetchInterval: 60_000 });
  const h = home.data;
  // until we know the status, show only what an unapproved resident may open (no flash of the full menu on refresh)
  const limited = h ? h.limited_access : true;

  const full: NavItem[] = [
    { href: "/resident/home", label: "Home" },
    { href: "/resident/society", label: "My society" },
    { href: "/resident/services", label: "Group deals" },
    { href: "/resident/bookings", label: "My bookings", count: h?.active_bookings },
    { href: "/resident/maintenance", label: "Maintenance", count: h?.maintenance?.unpaid_bills },
    { href: "/resident/complaints", label: "Complaints" },
    { href: "/resident/requests", label: "Requests" },
    { href: "/resident/worship", label: "Religious places" },
    { href: "/resident/notices", label: "Notices" },
    { href: "/resident/notifications", label: "Notifications", count: h?.unread_notifications },
    { href: "/resident/profile", label: "Profile & family" },
  ];
  const items = limited ? full.filter((i) => i.href === "/resident/home" || i.href === "/resident/profile") : full;

  return (
    <>
      <SidebarBrand subtitle="Resident" theme="light" />

      {/* only this middle part scrolls; logo above and user + Log out below stay in place */}
      <div className="scroll-thin -mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-3">

      <HomeSwitcher society={h?.society.name} flat={h?.unit.label} />

      <div className="mt-[18px]">
        <SidebarNav items={items} theme="light" />
      </div>

      </div>

      <SidebarFooter name={me.data?.name} sub={titleCase(h?.resident.resident_type)} />
    </>
  );
}
