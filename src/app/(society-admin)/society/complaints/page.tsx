"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Chip, PageHeader, Skeleton } from "@/components/ui";
import { ComplaintCard } from "@/components/society-admin/complaints/ComplaintCard";
import { ComplaintModal } from "@/components/society-admin/complaints/ComplaintModal";
import { complaintsApi, staffApi } from "@/lib/api/ops";
import { residentsApi } from "@/lib/api/residents";
import { sentence, unitLabel } from "@/lib/utils/format";

const COLUMNS = [
  { title: "Open", bg: "bg-pink-bg", statuses: ["open", "reopened"] },
  { title: "Assigned", bg: "bg-yellow-bg", statuses: ["assigned"] },
  { title: "In progress", bg: "bg-lilac-bg", statuses: ["in_progress"] },
  { title: "Resolved", bg: "bg-green-bg", statuses: ["resolved", "closed"] },
];

export default function ComplaintsPage() {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const complaints = useQuery({ queryKey: ["complaints", "all"], queryFn: () => complaintsApi.list() });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => staffApi.list() });
  const residents = useQuery({ queryKey: ["residents", "active"], queryFn: () => residentsApi.list({ status: "active" }) });

  const all = complaints.data?.items ?? [];
  const resMap = new Map(residents.data?.items.map((r) => [r.id, r]));
  const staffMap = new Map(staff.data?.items.map((s) => [s.id, s]));
  const categories = [...new Set(all.map((c) => c.category))];
  const rows = all.filter((c) => filter === "all" || (filter === "urgent" ? c.priority === "urgent" : c.category === filter));
  const open = all.filter((c) => !["resolved", "closed"].includes(c.status));
  const unit = (residentId: number) => { const r = resMap.get(residentId); return r ? unitLabel(r.wing_name, r.unit_no) : "—"; };

  return (
    <>
      <PageHeader
        title="Complaints,"
        light={`${open.length} open · ${open.filter((c) => c.priority === "urgent").length} urgent.`}
        actions={
          <>
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>All categories</Chip>
            <Chip active={filter === "urgent"} onClick={() => setFilter("urgent")}>Urgent</Chip>
            {categories.map((c) => <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>{sentence(c)}</Chip>)}
          </>
        }
      />
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = rows.filter((c) => col.statuses.includes(c.status));
          return (
            <section key={col.title} className={clsx("min-h-[720px] rounded-[24px] p-3.5", col.bg)}>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-[14px] font-bold leading-[18px] text-ink">{col.title}</h2>
                <span className="rounded-full bg-white px-2 text-[11px] font-bold leading-[17px] text-ink">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                {complaints.isLoading && <Skeleton className="h-[127px] rounded-[18px] !bg-white/60" />}
                {items.map((c) => (
                  <ComplaintCard key={c.id} c={c} unit={unit(c.resident_id)} staff={c.assigned_to ? staffMap.get(c.assigned_to) : undefined} onOpen={() => setOpenId(c.id)} />
                ))}
                {!complaints.isLoading && !items.length && <p className="px-1 py-6 text-center text-[12px] text-body/70">Nothing here</p>}
              </div>
            </section>
          );
        })}
      </div>
      {openId && <ComplaintModal id={openId} staff={staff.data?.items ?? []} onClose={() => setOpenId(null)} />}
    </>
  );
}
