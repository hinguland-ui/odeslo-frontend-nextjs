"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Button, ChipGroup, EmptyState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { residentApi } from "@/lib/api/resident";
import { ago, titleCase } from "@/lib/utils/format";

export default function ResidentNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = useQuery({ queryKey: ["resident", "notifications", filter], queryFn: () => residentApi.notifications(filter === "unread"), refetchInterval: 60_000 });
  const read = useAction((id: number) => residentApi.markRead(id), { invalidate: [["resident"]] });
  const readAll = useAction(() => residentApi.markAllRead(), { invalidate: [["resident"]], success: "All notifications marked as read" });
  const items = list.data?.items ?? [];

  return (
    <>
      <PageHeader title="Notifications," light="bookings, payments and notices." actions={<Button variant="light" loading={readAll.isPending} onClick={() => readAll.mutate(undefined)}>Mark all read</Button>} />
      <ChipGroup className="mb-4" value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }]} />
      <Panel padded={false}>
        {list.isLoading ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState title="Nothing here" />
        ) : (
          <ul className="divide-y divide-mist">
            {items.map((n) => (
              <li key={n.id}>
                <button onClick={() => !n.is_read && read.mutate(n.id)} className={clsx("flex w-full items-start gap-3 px-[18px] py-3.5 text-left transition hover:bg-panel", !n.is_read && "bg-lilac-bg/40")}>
                  <span className={clsx("mt-1.5 size-2 shrink-0 rounded-full", n.is_read ? "bg-line" : "bg-violet")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className={clsx("text-[13px] leading-4 text-ink", n.is_read ? "font-medium" : "font-bold")}>{n.title}</p>
                      <span className="shrink-0 text-[11px] text-muted">{ago(n.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-4 text-body">{n.body}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{titleCase(n.category)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
