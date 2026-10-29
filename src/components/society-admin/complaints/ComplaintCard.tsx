import clsx from "clsx";
import { Avatar, Badge } from "@/components/ui";
import type { Complaint, Staff } from "@/lib/types/ops";
import { ago, sentence } from "@/lib/utils/format";
import type { Tone } from "@/lib/utils/tones";

export const PRIORITY_TONE: Record<string, Tone> = { urgent: "pink", high: "peach", medium: "yellow", low: "gray" };

export function ComplaintCard({ c, unit, staff, onOpen }: { c: Complaint; unit: string; staff?: Staff; onOpen: () => void }) {
  const urgent = c.priority === "urgent" && c.status !== "resolved" && c.status !== "closed";
  return (
    <button onClick={onOpen} className={clsx("block w-full rounded-[18px] border bg-white p-3 text-left transition hover:shadow-sm", urgent ? "border-pink-fg" : "border-transparent")}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold leading-[13px] text-muted">{sentence(c.category)} · {unit}</span>
        <Badge size="sm" dot={false} tone={PRIORITY_TONE[c.priority] ?? "gray"}>{sentence(c.priority)}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-[17.5px] text-ink">{c.description}</p>
      <p className="mt-1.5 text-[11px] leading-[13px] text-muted">{c.complaint_no} · {ago(c.created_at)}</p>
      <div className="mt-2 flex items-center gap-1.5 border-t border-mist pt-1.5">
        {staff ? <Avatar name={staff.name} size={22} /> : <span className="grid size-[22px] place-items-center rounded-full bg-mist text-[10px] font-bold text-ink">?</span>}
        <span className="truncate text-[11px] font-semibold leading-[13px] text-body">{staff ? `${staff.name} · ${staff.type}` : "Not assigned"}</span>
      </div>
    </button>
  );
}
