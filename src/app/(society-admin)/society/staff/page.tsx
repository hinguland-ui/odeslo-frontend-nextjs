"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, EmptyState, Note, PageHeader, Panel, Skeleton } from "@/components/ui";
import { StaffCard } from "@/components/society-admin/staff/StaffCard";
import { AddStaffModal, AssignTaskModal } from "@/components/society-admin/staff/StaffModals";
import { complaintsApi, staffApi } from "@/lib/api/ops";
import type { Staff } from "@/lib/types/ops";

export default function StaffPage() {
  const [adding, setAdding] = useState(false);
  const [assigning, setAssigning] = useState<Staff | null>(null);
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => staffApi.list() });
  const complaints = useQuery({ queryKey: ["complaints", "all"], queryFn: () => complaintsApi.list() });

  const all = staff.data?.items ?? [];
  const openFor = (id: number) => complaints.data?.items.filter((c) => c.assigned_to === id && ["assigned", "in_progress"].includes(c.status)).length ?? 0;
  const active = all.filter((s) => s.status === "active");

  return (
    <>
      <PageHeader
        title="Staff,"
        light={`${all.length} people · ${active.filter((s) => openFor(s.id)).length} on a task.`}
        actions={<Button plus onClick={() => setAdding(true)}>Add staff</Button>}
      />
      {staff.isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[188px] rounded-[24px]" />)}</div>
      ) : !all.length ? (
        <Panel><EmptyState title="No staff yet" action={<Button size="sm" onClick={() => setAdding(true)}>Add staff</Button>} /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {all.map((s) => <StaffCard key={s.id} s={s} openTasks={openFor(s.id)} onAssign={() => setAssigning(s)} />)}
        </div>
      )}
      <Note className="mt-4 !rounded-[20px] !px-4 !py-3.5 !text-[13px]">
        Staff log in with their mobile number and see only the tasks and complaints assigned to them.
      </Note>
      <AddStaffModal open={adding} onClose={() => setAdding(false)} />
      {assigning && <AssignTaskModal staff={assigning} complaints={complaints.data?.items ?? []} onClose={() => setAssigning(null)} />}
    </>
  );
}
