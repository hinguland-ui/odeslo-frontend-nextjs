"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { locationRequestsApi } from "@/lib/api/societies";
import { dealsApi, jobsApi, partnersApi } from "@/lib/api/deals";
import { useMe } from "@/hooks/useMe";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarBrand, SidebarNav, type NavItem } from "./SidebarNav";

export function SuperSidebar() {
  const me = useMe();
  const dash = useQuery({ queryKey: ["dashboard", "super"], queryFn: dashboardApi.super, refetchInterval: 60_000 });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const vendors = useQuery({ queryKey: ["partners"], queryFn: () => partnersApi.list() });
  const payouts = useQuery({ queryKey: ["jobs", "payouts"], queryFn: () => jobsApi.list({ assigned_to_type: "partner" }) });

  const locReqs = useQuery({ queryKey: ["location-requests", "pending"], queryFn: () => locationRequestsApi.list("pending"), refetchInterval: 60_000 });

  const d = dash.data;
  const platformItems = catalog.data?.items.filter((x) => x.society_id === null).length;
  const pendingPayouts = new Set(
    payouts.data?.items.filter((j) => j.status === "completed" && j.payout_status === "pending").map((j) => j.deal_id),
  ).size;

  const items: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/societies", label: "Societies", count: d?.societies.total },
    { href: "/admin/location-requests", label: "Location requests", count: locReqs.data?.length },
    { href: "/admin/features", label: "Feature controls" },
    { href: "/admin/catalog", label: "Catalog", count: platformItems },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/vendors", label: "Vendors", count: vendors.data?.total },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/refunds", label: "Refunds", count: d?.pending_refunds },
    { href: "/admin/settlement", label: "Settlement", count: pendingPayouts },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/storage", label: "Storage" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <>
      <SidebarBrand subtitle="Super Admin" theme="dark" />

      {/* only this middle part scrolls; logo above and user + Log out below stay in place */}
      <div className="scroll-thin -mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
      <div className="mt-[18px]">
        <SidebarNav items={items} theme="dark" />
      </div>

      </div>

      <SidebarFooter dark name={me.data?.name} sub="Super admin · 2FA on" />
    </>
  );
}
