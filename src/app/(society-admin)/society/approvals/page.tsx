"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ChipGroup, EmptyState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { ApprovalCard } from "@/components/society-admin/approvals/ApprovalCard";
import { residentsApi } from "@/lib/api/residents";

type Tab = "pending" | "approved" | "rejected";

function ApprovalsScreen() {
  const focus = Number(useSearchParams().get("id")) || null;
  const [tab, setTab] = useState<Tab>("pending");
  const pending = useQuery({ queryKey: ["residents", "pending"], queryFn: residentsApi.pending });
  const approved = useQuery({ queryKey: ["residents", "active"], queryFn: () => residentsApi.list({ status: "active" }), enabled: tab === "approved" });
  const rejected = useQuery({ queryKey: ["residents", "rejected"], queryFn: () => residentsApi.list({ status: "rejected" }), enabled: tab === "rejected" });

  const source = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
  const rows = [...(source.data?.items ?? [])]
    .sort((a, b) => (tab === "approved" ? (b.approved_at ?? "").localeCompare(a.approved_at ?? "") : Number(b.id === focus) - Number(a.id === focus)))
    .slice(0, tab === "approved" ? 20 : undefined);

  return (
    <>
      <PageHeader
        title="Approval queue,"
        light={`${pending.data?.total ?? 0} waiting.`}
        subtitle="Residents get limited access (Masjid & Namaz only) until you approve."
        actions={
          <ChipGroup value={tab} onChange={setTab} options={[
            { value: "pending", label: `Pending · ${pending.data?.total ?? 0}` },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]} />
        }
      />
      {source.isLoading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[250px] rounded-[24px]" />)}</div>
      ) : !rows.length ? (
        <Panel><EmptyState title={tab === "pending" ? "No one is waiting" : "Nothing here yet"} hint={tab === "pending" ? "New join requests from the resident app appear here." : undefined} /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {rows.map((r) => <ApprovalCard key={r.id} resident={r} highlight={r.id === focus} />)}
        </div>
      )}
    </>
  );
}

export default function ApprovalsPage() {
  return <Suspense><ApprovalsScreen /></Suspense>;
}
