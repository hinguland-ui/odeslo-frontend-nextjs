"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, CellTitle, ChipGroup, DataTable, EmptyState, SearchInput, StatusBadge, type Column } from "@/components/ui";
import { residentsApi } from "@/lib/api/residents";
import type { Resident } from "@/lib/types/resident";
import { fullDate, sentence, unitLabel } from "@/lib/utils/format";

type Status = "active" | "pending_approval" | "rejected" | "deactivated";
const LABEL: Record<Status, string> = { active: "Approved", pending_approval: "Pending", rejected: "Rejected", deactivated: "Deactivated" };

/** Everyone who lives (or asked to live) in this society, by status. */
export function SocietyResidents({ societyId }: { societyId: number }) {
  const [status, setStatus] = useState<Status>("active");
  const [q, setQ] = useState("");
  const list = useQuery({ queryKey: ["residents", "society", societyId, status], queryFn: () => residentsApi.list({ society_id: societyId, status }) });
  const counts = useQuery({
    queryKey: ["residents", "society", societyId, "counts"],
    queryFn: async () => {
      const entries = await Promise.all((Object.keys(LABEL) as Status[]).map(async (s) => [s, (await residentsApi.list({ society_id: societyId, status: s })).total] as const));
      return Object.fromEntries(entries) as Record<Status, number>;
    },
  });

  const needle = q.trim().toLowerCase();
  const rows = (list.data?.items ?? []).filter((r) => !needle || r.name.toLowerCase().includes(needle) || r.mobile.includes(needle) || unitLabel(r.wing_name, r.unit_no).toLowerCase().includes(needle));

  const columns: Column<Resident>[] = [
    { key: "n", header: "Resident", width: "1.5fr", render: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.name} size={32} /><CellTitle title={r.name} sub={`+91 ${r.mobile}`} /></div> },
    { key: "u", header: "Flat", width: "0.7fr", render: (r) => <span className="font-semibold">{unitLabel(r.wing_name, r.unit_no)}</span> },
    { key: "t", header: "Type", width: "0.8fr", render: (r) => sentence(r.resident_type) },
    { key: "j", header: "Joined", width: "0.9fr", render: (r) => fullDate(r.created_at) },
    { key: "s", header: "Status", width: "0.9fr", render: (r) => <StatusBadge status={r.status} /> },
    { key: "x", header: "Note", width: "1.3fr", render: (r) => <span className="text-body">{r.rejection_reason ? `Rejected: ${r.rejection_reason}` : r.unit_occupied_flag ? "Flat already occupied" : "—"}</span> },
  ];

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <SearchInput value={q} onChange={setQ} placeholder="Name, mobile or flat" className="!h-11 w-[260px] !rounded-[22px]" />
        <ChipGroup
          value={status}
          onChange={setStatus}
          options={(Object.keys(LABEL) as Status[]).map((s) => ({ value: s, label: `${LABEL[s]}${counts.data ? ` · ${counts.data[s]}` : ""}` }))}
        />
      </div>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={list.isLoading} rowHeight={55} className="min-h-[300px]" empty={<EmptyState title={`No ${LABEL[status].toLowerCase()} residents`} />} />
    </>
  );
}
