"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, EmptyState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { openFile } from "@/lib/api/client";
import { residentApi } from "@/lib/api/resident";
import { fullDate, titleCase } from "@/lib/utils/format";

const TONE: Record<string, "pink" | "blue" | "lilac" | "yellow" | "gray"> = { emergency: "pink", event: "blue", meeting: "lilac", notice: "yellow" };

export default function ResidentNoticesPage() {
  const list = useQuery({ queryKey: ["resident", "announcements"], queryFn: residentApi.announcements });
  const items = list.data?.items ?? [];
  return (
    <>
      <PageHeader title="Notices," light="from your society and Odeslo." />
      {list.isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : items.length === 0 ? (
        <Panel><EmptyState title="No notices yet" /></Panel>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Panel key={n.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-bold text-ink">{n.title}</h2>
                  {n.is_pinned && <Badge tone="lilac" size="sm" dot={false}>Pinned</Badge>}
                  {n.is_platform && <Badge tone="blue" size="sm" dot={false}>Odeslo</Badge>}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <Badge tone={TONE[n.category] ?? "gray"} size="sm" dot={false}>{titleCase(n.category)}</Badge>
                  {fullDate(n.created_at)}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-[18px] text-body">{n.body}</p>
              {n.attachment && <button onClick={() => openFile(n.attachment!)} className="mt-2 text-[12px] font-semibold text-lilac-fg hover:underline">View attachment</button>}
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
