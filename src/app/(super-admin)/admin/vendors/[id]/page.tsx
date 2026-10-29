"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { Avatar, Badge, Button, CellTitle, ChipGroup, DataTable, EmptyState, PageHeader, StatCard, StatusBadge, type Column } from "@/components/ui";
import { VendorHistory } from "@/components/super-admin/vendors/detail/VendorHistory";
import { VendorOverview } from "@/components/super-admin/vendors/detail/VendorOverview";
import { vendorStatus } from "@/components/super-admin/vendors/VendorAside";
import { useAction } from "@/hooks/useAction";
import { useLookups } from "@/hooks/useLookups";
import { dealsApi, jobsApi, partnersApi } from "@/lib/api/deals";
import type { Deal, PartnerApplication, ServiceJob } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { dayMonth, fullDate, inr, time } from "@/lib/utils/format";

type Tab = "overview" | "jobs" | "deals" | "applications" | "history";

export default function VendorDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const look = useLookups();
  const [tab, setTab] = useState<Tab>("overview");

  const partner = useQuery({ queryKey: ["partners", id], queryFn: () => partnersApi.get(id) });
  const earnings = useQuery({ queryKey: ["partners", id, "earnings"], queryFn: () => partnersApi.earnings(id) });
  const jobs = useQuery({ queryKey: ["jobs", "partner", id], queryFn: () => jobsApi.list({ assigned_to_type: "partner", assigned_to_id: id }) });
  const deals = useQuery({ queryKey: ["deals", "all"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const apps = useQuery({ queryKey: ["partners", id, "applications"], queryFn: () => partnersApi.applications(id) });

  const inv = [["partners"], ["dashboard"]];
  const verify = useAction(() => partnersApi.verify(id), { success: "Vendor verified", invalidate: inv });
  const unverify = useAction(() => partnersApi.unverify(id), { success: "Verification removed", invalidate: inv });
  const hold = useAction(() => partnersApi.deactivate(id), { success: "Vendor put on hold", invalidate: inv });
  const activate = useAction(() => partnersApi.activate(id), { success: "Vendor reactivated", invalidate: inv });

  const p = partner.data;
  if (partner.isLoading) return <PageLoader label="Loading vendor" />;
  if (!p) return <EmptyState title="Vendor not found" action={<Button size="sm" href="/admin/vendors">Back to vendors</Button>} />;

  const myJobs = jobs.data?.items ?? [];
  const myDeals = (deals.data?.items ?? []).filter((d) => d.partner_id === id);
  const myApps = apps.data ?? [];
  const done = myJobs.filter((j) => j.status === "completed").length;
  const st = vendorStatus(p);

  const jobCols: Column<ServiceJob>[] = [
    { key: "j", header: "Job", width: "1.5fr", render: (j) => <CellTitle title={j.title} sub={j.job_no} /> },
    { key: "s", header: "Society", width: "1fr", render: (j) => (j.society_id ? look.society(j.society_id) : `${j.society_name ?? "Society"} (deleted)`) },
    { key: "w", header: "Scheduled", width: "1fr", render: (j) => (j.scheduled_at ? `${dayMonth(j.scheduled_at)} · ${time(j.scheduled_at)}` : "—") },
    { key: "st", header: "Status", width: "0.8fr", render: (j) => <StatusBadge status={j.status} /> },
    { key: "p", header: "Payout", width: "1fr", render: (j) => <span><span className="font-semibold">{inr(j.payout_amount)}</span> <span className="text-muted">· {j.payout_status.replace("_", " ")}</span></span> },
    { key: "r", header: "Rating", width: "0.6fr", render: (j) => (j.rating != null ? `★ ${j.rating}` : "—") },
  ];
  const dealCols: Column<Deal>[] = [
    { key: "d", header: "Deal", width: "1.6fr", render: (d) => <CellTitle title={d.title} sub={categoryOf(d.category).label} /> },
    { key: "s", header: "Society", width: "1fr", render: (d) => look.society(d.society_id) },
    { key: "w", header: "Service date", width: "0.9fr", render: (d) => fullDate(d.service_date) },
    { key: "u", header: "Units", width: "0.6fr", render: (d) => `${d.confirmed_units}/${d.max_units}` },
    { key: "p", header: "Payout / unit", width: "0.8fr", render: (d) => (d.partner_payout_per_unit != null ? inr(d.partner_payout_per_unit) : "—") },
    { key: "st", header: "Status", width: "0.8fr", render: (d) => <StatusBadge status={d.status} /> },
  ];
  const appCols: Column<PartnerApplication>[] = [
    { key: "d", header: "Deal", width: "1.6fr", render: (a) => <CellTitle title={a.deal_title} sub={categoryOf(a.category).label} /> },
    { key: "s", header: "Society", width: "1fr", render: (a) => look.society(a.society_id) },
    { key: "q", header: "Asked / unit", width: "0.8fr", render: (a) => (a.quote_per_unit != null ? inr(a.quote_per_unit) : "—") },
    { key: "m", header: "Message", width: "1.3fr", render: (a) => <span className="text-body">{a.message ?? "—"}</span> },
    { key: "on", header: "Applied", width: "0.8fr", render: (a) => dayMonth(a.created_at) },
    { key: "st", header: "Result", width: "0.8fr", render: (a) => <Badge tone={a.status === "accepted" ? "green" : a.status === "rejected" ? "pink" : a.status === "withdrawn" ? "gray" : "yellow"}>{a.status === "applied" ? "Pending" : a.status[0]!.toUpperCase() + a.status.slice(1)}</Badge> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/admin/vendors" className="hover:underline">Vendors</Link>}
        title={p.business_name ?? p.name}
        light={`${p.categories.map((c) => categoryOf(c).label).join(", ")}.`}
        subtitle={`${p.name} · +91 ${p.mobile}${p.email ? ` · ${p.email}` : ""}`}
        actions={
          <>
            <Badge tone={st.tone} dot={false}>{st.label}</Badge>
            {p.status !== "active" ? (
              <Button loading={activate.isPending} onClick={() => activate.mutate(undefined)}>Reactivate</Button>
            ) : (
              <>
                {p.verified ? <Button variant="light" loading={unverify.isPending} onClick={() => unverify.mutate(undefined)}>Remove verification</Button> : <Button loading={verify.isPending} onClick={() => verify.mutate(undefined)}>Verify vendor</Button>}
                <Button variant="danger" loading={hold.isPending} onClick={() => hold.mutate(undefined)}>Put on hold</Button>
              </>
            )}
          </>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Avatar name={p.business_name ?? p.name} size={44} shape="rounded" />
        <p className="text-[12px] text-muted">Joined {fullDate(p.created_at)}{p.verified_at ? ` · verified ${fullDate(p.verified_at)}` : " · not verified yet"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard tone="blue" label="Jobs" value={`${done}/${myJobs.length}`} loading={jobs.isLoading} sub="Completed / assigned" />
        <StatCard tone="green" label="Earned" value={inr(earnings.data?.total_earned)} loading={earnings.isLoading} sub={`${inr(earnings.data?.paid)} paid`} />
        <StatCard tone="yellow" label="Pending payout" value={inr(earnings.data?.pending)} loading={earnings.isLoading} sub="Owed to vendor" />
        <StatCard tone="peach" label="Rating" value={p.rating_count ? `★ ${p.rating_avg.toFixed(1)}` : "—"} sub={`${p.rating_count} reviews`} />
        <StatCard tone="lilac" label="Societies" value={p.society_ids.length} sub="Assigned" />
        <StatCard tone="blue" label="Deals" value={myDeals.length} loading={deals.isLoading} sub={`${myApps.length} applications`} />
      </div>

      <ChipGroup
        className="my-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: "overview", label: "Overview" },
          { value: "jobs", label: `Jobs · ${myJobs.length}` },
          { value: "deals", label: `Deals · ${myDeals.length}` },
          { value: "applications", label: `Applications · ${myApps.length}` },
          { value: "history", label: "History" },
        ]}
      />

      {tab === "overview" && <VendorOverview partner={p} societies={look.societies} />}
      {tab === "jobs" && <DataTable columns={jobCols} rows={myJobs} rowKey={(j) => j.id} loading={jobs.isLoading} rowHeight={55} empty={<EmptyState title="No jobs assigned yet" />} />}
      {tab === "deals" && <DataTable columns={dealCols} rows={myDeals} rowKey={(d) => d.id} loading={deals.isLoading} rowHeight={55} empty={<EmptyState title="No deals awarded yet" />} />}
      {tab === "applications" && <DataTable columns={appCols} rows={myApps} rowKey={(a) => a.id} loading={apps.isLoading} rowHeight={55} empty={<EmptyState title="This vendor has not applied to any deal" />} />}
      {tab === "history" && <VendorHistory partnerId={id} jobs={myJobs} />}
    </>
  );
}
