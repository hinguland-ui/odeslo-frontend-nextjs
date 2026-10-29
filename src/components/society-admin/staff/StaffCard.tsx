"use client";

import { Avatar, Badge, Button } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { staffApi } from "@/lib/api/ops";
import type { Staff } from "@/lib/types/ops";
import { relativeDay, sentence } from "@/lib/utils/format";

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-panel px-2.5 py-2">
      <p className="text-[10px] leading-3 text-muted">{label}</p>
      <p className="truncate text-[12px] font-bold leading-[15px] text-ink">{value}</p>
    </div>
  );
}

export function StaffCard({ s, openTasks, onAssign }: { s: Staff; openTasks: number; onAssign: () => void }) {
  const toggle = useAction(() => (s.status === "active" ? staffApi.deactivate(s.id) : staffApi.activate(s.id)), {
    success: s.status === "active" ? `${s.name} deactivated` : `${s.name} activated`, invalidate: [["staff"]],
  });
  const active = s.status === "active";
  return (
    <article className="rounded-[24px] border border-line bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar name={s.name} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-[19px] text-ink">{s.name}</p>
          <p className="truncate text-[12px] leading-[15px] text-muted">{sentence(s.type)}{s.category ? ` · ${s.category}` : ""}</p>
        </div>
        {!active ? <Badge tone="gray">Inactive</Badge> : openTasks ? <Badge tone="lilac">On a task</Badge> : <Badge tone="green">Available</Badge>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini label="Last login" value={s.last_login_at ? relativeDay(s.last_login_at) : "Never"} />
        <Mini label="Open tasks" value={String(openTasks)} />
        <Mini label="ID proof" value={s.id_proof ? "Uploaded" : "Pending"} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" className="flex-1 !text-[12px]" disabled={!active} onClick={onAssign}>Assign task</Button>
        <Button size="sm" variant="light" className="!text-[12px]" href={`tel:+91${s.mobile}`}>Call</Button>
        <Button size="sm" variant={active ? "danger" : "success"} className="!text-[12px]" loading={toggle.isPending} onClick={() => toggle.mutate(undefined)}>
          {active ? "Disable" : "Enable"}
        </Button>
      </div>
    </article>
  );
}
