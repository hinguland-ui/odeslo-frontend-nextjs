"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, Badge, Button, CellTitle, Chip, DataTable, EmptyState, PageHeader, Panel, SearchInput, type Column } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { InviteModal } from "@/components/society-admin/residents/InviteModal";
import { ResidentAside } from "@/components/society-admin/residents/ResidentAside";
import { useMe } from "@/hooks/useMe";
import { bookingsApi } from "@/lib/api/deals";
import { maintenanceApi } from "@/lib/api/money";
import { residentsApi } from "@/lib/api/residents";
import { societiesApi } from "@/lib/api/societies";
import type { Resident } from "@/lib/types/resident";
import { sentence, unitLabel } from "@/lib/utils/format";
import { statusTone } from "@/lib/utils/status";
import { TONE } from "@/lib/utils/tones";

type Filter = "all" | "owner" | "tenant" | "deactivated" | `wing:${number}`;

export default function ResidentsPage() {
  const toast = useToast();
  const me = useMe();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);

  const active = useQuery({ queryKey: ["residents", "active"], queryFn: () => residentsApi.list({ status: "active" }) });
  const inactive = useQuery({ queryKey: ["residents", "deactivated"], queryFn: () => residentsApi.list({ status: "deactivated" }) });
  const wings = useQuery({ queryKey: ["wings", me.data?.society_id], queryFn: () => societiesApi.wings(me.data!.society_id!), enabled: !!me.data?.society_id });
  const bills = useQuery({ queryKey: ["bills"], queryFn: () => maintenanceApi.bills() });
  const bookings = useQuery({ queryKey: ["bookings", "society"], queryFn: () => bookingsApi.list() });

  const all = active.data?.items ?? [];
  const latestBill = new Map<number, string>();
  [...(bills.data?.items ?? [])].sort((a, b) => a.period_start.localeCompare(b.period_start)).forEach((b) => latestBill.set(b.unit_id, b.status));

  const base = filter === "deactivated" ? inactive.data?.items ?? [] : all;
  const needle = q.trim().toLowerCase();
  const rows = base.filter((r) => {
    if (filter === "owner" || filter === "tenant") { if (r.resident_type !== filter) return false; }
    if (filter.startsWith("wing:") && r.wing_id !== Number(filter.slice(5))) return false;
    return !needle || [r.name, r.mobile, unitLabel(r.wing_name, r.unit_no)].some((v) => v.toLowerCase().includes(needle));
  });
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  const exportCsv = () => residentsApi.exportCsv("active").catch((e) => toast(e.message, "error"));

  const columns: Column<Resident>[] = [
    { key: "u", header: "Unit", width: "0.6fr", render: (r) => <span className="font-bold">{unitLabel(r.wing_name, r.unit_no)}</span> },
    {
      key: "n", header: "Resident", width: "1.5fr",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size={30} />
          <CellTitle title={r.name} sub={r.is_primary ? "Primary member" : "Linked member"} />
        </div>
      ),
    },
    { key: "t", header: "Type", width: "0.8fr", render: (r) => <Badge dot={false} tone={r.resident_type === "owner" ? "lilac" : r.resident_type === "tenant" ? "blue" : "gray"}>{sentence(r.resident_type)}</Badge> },
    { key: "m", header: "Mobile", width: "1.1fr", render: (r) => <span className="text-body">+91 {r.mobile}</span> },
    {
      key: "mt", header: "Maintenance", width: "0.9fr",
      render: (r) => {
        const s = latestBill.get(r.unit_id);
        if (!s) return <span className="text-[12px] text-muted">—</span>;
        const t = TONE[statusTone(s)];
        return <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${t.fg}`}><span className={`size-1.5 rounded-full ${t.dot}`} />{sentence(s)}</span>;
      },
    },
    { key: "j", header: "Joined", width: "0.8fr", render: (r) => <span className="text-[12px] text-muted">{new Date(r.approved_at ?? r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Residents,"
        light={`${all.length} approved.`}
        actions={<><Button variant="light" onClick={exportCsv}>Export Excel</Button><Button plus onClick={() => setInviting(true)}>Add resident</Button></>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, unit or phone" className="!h-11 w-[320px] !rounded-[22px]" />
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All · {all.length}</Chip>
        <Chip active={filter === "owner"} onClick={() => setFilter("owner")}>Owners · {all.filter((r) => r.resident_type === "owner").length}</Chip>
        <Chip active={filter === "tenant"} onClick={() => setFilter("tenant")}>Tenants · {all.filter((r) => r.resident_type === "tenant").length}</Chip>
        {wings.data?.map((w) => (
          <Chip key={w.id} active={filter === `wing:${w.id}`} onClick={() => setFilter(`wing:${w.id}`)}>Wing {w.name}</Chip>
        ))}
        <Chip active={filter === "deactivated"} onClick={() => setFilter("deactivated")}>Deactivated · {inactive.data?.total ?? 0}</Chip>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DataTable
          columns={columns} rows={rows} rowKey={(r) => r.id} loading={active.isLoading} rowHeight={51}
          onRowClick={(r) => setSelectedId(r.id)} selectedKey={selected?.id} className="min-h-[652px]"
          empty={<EmptyState title="No residents found" hint="Approved residents show up here." />}
          footer={<div className="border-t border-mist px-[18px] py-3 text-[12px] text-muted">Showing {rows.length} of {base.length}</div>}
        />
        {selected ? (
          <ResidentAside key={selected.id} resident={selected} billStatus={latestBill.get(selected.unit_id)}
            bookings={bookings.data?.items.filter((b) => b.resident_id === selected.id).length ?? 0} />
        ) : (
          <Panel variant="soft"><EmptyState title="Select a resident" /></Panel>
        )}
      </div>
      <InviteModal open={inviting} onClose={() => setInviting(false)} societyId={me.data?.society_id} />
    </>
  );
}
