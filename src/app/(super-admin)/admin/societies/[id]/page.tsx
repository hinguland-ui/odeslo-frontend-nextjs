"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { Avatar, Badge, Button, CellTitle, ChipGroup, DataTable, EmptyState, PageHeader, StatCard, StatusBadge, type Column } from "@/components/ui";
import { SocietyActivity } from "@/components/super-admin/societies/detail/SocietyActivity";
import { SocietyOverview } from "@/components/super-admin/societies/detail/SocietyOverview";
import { SocietyResidents } from "@/components/super-admin/societies/detail/SocietyResidents";
import { SocietyUnits } from "@/components/super-admin/societies/detail/SocietyUnits";
import { DeleteSocietyModal } from "@/components/super-admin/societies/detail/DeleteSocietyModal";
import { SocietyStatusModal } from "@/components/super-admin/societies/SocietyStatusModal";
import { dealsApi, bookingsApi, partnersApi } from "@/lib/api/deals";
import { maintenanceApi } from "@/lib/api/money";
import { complaintsApi } from "@/lib/api/ops";
import { societiesApi } from "@/lib/api/societies";
import type { Bill } from "@/lib/types/money";
import type { Complaint } from "@/lib/types/ops";
import type { Deal, Partner } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { ago, fullDate, inr, initials, sentence } from "@/lib/utils/format";
import { toneFor } from "@/lib/utils/tones";

type Tab = "overview" | "residents" | "flats" | "deals" | "vendors" | "complaints" | "maintenance" | "history";

export default function SocietyDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [tab, setTab] = useState<Tab>("overview");
  const [managing, setManaging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const society = useQuery({ queryKey: ["society", id], queryFn: () => societiesApi.get(id) });
  const admins = useQuery({ queryKey: ["society-admins", id], queryFn: () => societiesApi.admins(id) });
  const deals = useQuery({ queryKey: ["deals", "society", id], queryFn: () => dealsApi.list({ society_id: id, include_platform: false }) });
  const bookings = useQuery({ queryKey: ["bookings", "society", id], queryFn: () => bookingsApi.list({ society_id: id, exclude_cancelled: true }) });
  const vendors = useQuery({ queryKey: ["partners", "society", id], queryFn: () => partnersApi.list({ society_id: id }) });
  const complaints = useQuery({ queryKey: ["complaints", "society", id], queryFn: () => complaintsApi.list({ society_id: id }) });
  const mSummary = useQuery({ queryKey: ["maintenance", "summary", id], queryFn: () => maintenanceApi.summary(undefined, id) });
  const bills = useQuery({ queryKey: ["maintenance", "bills", id], queryFn: () => maintenanceApi.bills({ society_id: id }), enabled: tab === "maintenance" });

  const s = society.data;
  if (society.isLoading) return <PageLoader label="Loading society" />;
  if (!s) return <EmptyState title="Society not found" action={<Button size="sm" href="/admin/societies">Back to societies</Button>} />;

  const dealRows = deals.data?.items ?? [];
  const vendorRows = vendors.data?.items ?? [];
  const complaintRows = complaints.data?.items ?? [];
  const gmv = (bookings.data?.items ?? []).reduce((sum, b) => sum + b.amount, 0);
  const m = mSummary.data;

  const dealCols: Column<Deal>[] = [
    { key: "d", header: "Deal", width: "1.6fr", render: (d) => <CellTitle title={d.title} sub={categoryOf(d.category).label} /> },
    { key: "w", header: "Service date", width: "0.9fr", render: (d) => fullDate(d.service_date) },
    { key: "u", header: "Units", width: "0.6fr", render: (d) => `${d.confirmed_units}/${d.max_units}` },
    { key: "p", header: "Price / unit", width: "0.8fr", render: (d) => inr(d.price_per_unit) },
    { key: "v", header: "Vendor", width: "1fr", render: (d) => vendorRows.find((v) => v.id === d.partner_id)?.business_name ?? (d.partner_id ? `Vendor #${d.partner_id}` : <Badge tone="yellow" size="sm" dot={false}>Not awarded</Badge>) },
    { key: "st", header: "Status", width: "0.8fr", render: (d) => <StatusBadge status={d.status} /> },
  ];
  const vendorCols: Column<Partner>[] = [
    { key: "v", header: "Vendor", width: "1.5fr", render: (v) => <Link href={`/admin/vendors/${v.id}`} className="block"><CellTitle title={v.business_name ?? v.name} sub={v.name} /></Link> },
    { key: "c", header: "Services", width: "1.4fr", render: (v) => v.categories.map((c) => categoryOf(c).label).join(", ") },
    { key: "r", header: "Rating", width: "0.7fr", render: (v) => (v.rating_count ? `★ ${v.rating_avg.toFixed(1)} (${v.rating_count})` : "—") },
    { key: "d", header: "Deals here", width: "0.7fr", render: (v) => dealRows.filter((d) => d.partner_id === v.id).length },
    { key: "st", header: "Status", width: "0.8fr", render: (v) => <Badge tone={v.verified && v.status === "active" ? "green" : "yellow"}>{v.verified ? (v.status === "active" ? "Verified" : "On hold") : "Pending"}</Badge> },
  ];
  const complaintCols: Column<Complaint>[] = [
    { key: "c", header: "Complaint", width: "1.7fr", render: (c) => <CellTitle title={sentence(c.category)} sub={`${c.complaint_no} · ${c.description}`} /> },
    { key: "p", header: "Priority", width: "0.7fr", render: (c) => sentence(c.priority) },
    { key: "r", header: "Reopened", width: "0.7fr", render: (c) => c.reopened_count || "—" },
    { key: "d", header: "Raised", width: "0.8fr", render: (c) => ago(c.created_at) },
    { key: "s", header: "Status", width: "0.8fr", render: (c) => <StatusBadge status={c.status} /> },
  ];
  const billCols: Column<Bill>[] = [
    { key: "b", header: "Bill", width: "1.2fr", render: (b) => <CellTitle title={b.period} sub={b.bill_no} /> },
    { key: "u", header: "Flat", width: "0.7fr", render: (b) => b.unit_label ?? "—" },
    { key: "d", header: "Due", width: "0.9fr", render: (b) => fullDate(b.due_date) },
    { key: "a", header: "Amount", width: "0.8fr", render: (b) => inr(b.total_amount) },
    { key: "o", header: "Outstanding", width: "0.8fr", render: (b) => <span className="font-semibold">{inr(b.outstanding)}</span> },
    { key: "s", header: "Status", width: "0.8fr", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/admin/societies" className="hover:underline">Societies</Link>}
        title={s.name}
        light={`${s.area}, ${s.city}.`}
        subtitle={`Code ${s.code} · ${sentence(s.type)}`}
        actions={<><StatusBadge status={s.status} /><Button variant="light" onClick={() => setManaging(true)}>Manage status</Button><Button variant="danger" onClick={() => setDeleting(true)}>Delete society</Button></>}
      />
      <div className="mb-4 flex items-center gap-3"><Avatar label={initials(s.name, 3)} tone={toneFor(s.code)} size={44} shape="rounded" /><p className="text-[12px] text-muted">Onboarded {fullDate(s.created_at)}</p></div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard tone="blue" label="Flats" value={s.stats.units} sub={`${s.stats.occupied_units} occupied · ${s.stats.wings} wings`} />
        <StatCard tone="green" label="Residents" value={s.stats.active_residents} sub="Approved" />
        <StatCard tone="yellow" label="Pending" value={s.stats.pending_residents} sub="Waiting for approval" />
        <StatCard tone="lilac" label="Deals" value={dealRows.length} loading={deals.isLoading} sub={`${bookings.data?.total ?? 0} bookings`} />
        <StatCard tone="peach" label="GMV" value={inr(gmv)} loading={bookings.isLoading} sub="Excl. cancelled" />
        <StatCard tone="green" label="Maintenance" value={inr(m?.collected)} loading={mSummary.isLoading} sub={`${inr(m?.pending)} pending`} />
      </div>

      <ChipGroup
        className="my-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: "overview", label: "Overview" },
          { value: "residents", label: `Residents · ${s.stats.active_residents}` },
          { value: "flats", label: `Flats · ${s.stats.units}` },
          { value: "deals", label: `Deals · ${dealRows.length}` },
          { value: "vendors", label: `Vendors · ${vendorRows.length}` },
          { value: "complaints", label: `Complaints · ${complaintRows.length}` },
          { value: "maintenance", label: "Maintenance" },
          { value: "history", label: "History" },
        ]}
      />

      {tab === "overview" && <SocietyOverview society={s} admins={admins.data ?? []} />}
      {tab === "residents" && <SocietyResidents societyId={id} />}
      {tab === "flats" && <SocietyUnits societyId={id} />}
      {tab === "deals" && <DataTable columns={dealCols} rows={dealRows} rowKey={(d) => d.id} loading={deals.isLoading} rowHeight={55} empty={<EmptyState title="No deals yet" />} />}
      {tab === "vendors" && <DataTable columns={vendorCols} rows={vendorRows} rowKey={(v) => v.id} loading={vendors.isLoading} rowHeight={55} empty={<EmptyState title="No vendor assigned to this society" hint="Assign vendors from Super admin → Vendors." />} />}
      {tab === "complaints" && <DataTable columns={complaintCols} rows={complaintRows} rowKey={(c) => c.id} loading={complaints.isLoading} rowHeight={55} empty={<EmptyState title="No complaints" />} />}
      {tab === "maintenance" && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard size="sm" tone="blue" label="Billed" value={inr(m?.billed)} loading={mSummary.isLoading} />
            <StatCard size="sm" tone="green" label="Collected" value={inr(m?.collected)} loading={mSummary.isLoading} />
            <StatCard size="sm" tone="yellow" label="Pending" value={inr(m?.pending)} loading={mSummary.isLoading} />
            <StatCard size="sm" tone="pink" label="Overdue bills" value={m?.overdue_bills ?? 0} loading={mSummary.isLoading} />
          </div>
          <DataTable columns={billCols} rows={bills.data?.items} rowKey={(b) => b.id} loading={bills.isLoading} rowHeight={53} empty={<EmptyState title="No bills generated yet" />} />
        </>
      )}
      {tab === "history" && <SocietyActivity societyId={id} />}

      {deleting && <DeleteSocietyModal society={s} onClose={() => setDeleting(false)} />}
      <SocietyStatusModal key={managing ? s.id : 0} society={managing ? s : null} onClose={() => setManaging(false)} />
    </>
  );
}
