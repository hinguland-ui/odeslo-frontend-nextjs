"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { EmptyState, Eyebrow, PageHeader, Skeleton } from "@/components/ui";
import { AnnouncementForm } from "@/components/society-admin/announcements/AnnouncementForm";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { openFile } from "@/lib/api/client";
import { dashboardApi } from "@/lib/api/dashboard";
import { announcementsApi } from "@/lib/api/ops";
import { dayMonth } from "@/lib/utils/format";
import { TONE, type Tone } from "@/lib/utils/tones";

const CAT: Record<string, { tone: Tone; label: string }> = {
  event: { tone: "green", label: "EVENT" },
  meeting: { tone: "lilac", label: "MEETING" },
  emergency: { tone: "pink", label: "IMPORTANT" },
  notice: { tone: "yellow", label: "NOTICE" },
  general: { tone: "blue", label: "GENERAL" },
};

export default function AnnouncementsPage() {
  const toast = useToast();
  const list = useQuery({ queryKey: ["announcements"], queryFn: announcementsApi.list });
  const dash = useQuery({ queryKey: ["dashboard", "society"], queryFn: dashboardApi.society });
  const remove = useAction((id: number) => announcementsApi.remove(id), { success: "Announcement removed", invalidate: [["announcements"]] });

  return (
    <>
      <PageHeader title="Announcements," light="reach every home." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <AnnouncementForm homes={dash.data?.residents.count ?? 0} />
        <section>
          <Eyebrow className="text-muted">Recent</Eyebrow>
          <div className="mt-2.5 space-y-2.5">
            {list.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[86px] rounded-[20px]" />)}
            {!list.isLoading && !list.data?.items.length && <EmptyState title="No announcements yet" />}
            {list.data?.items.map((a) => {
              const c = CAT[a.category] ?? CAT.general!;
              return (
                <article key={a.id} className={clsx("rounded-[20px] px-4 py-3.5", TONE[c.tone].bg)}>
                  <div className="flex items-center justify-between text-[11px] leading-[13px]">
                    <span className={clsx("font-bold", TONE[c.tone].fg)}>{c.label}{a.is_pinned ? " · PINNED" : ""}{a.is_platform ? " · ODESLO" : ""}</span>
                    <span className="text-muted">{dayMonth(a.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-bold leading-[18px] text-ink">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-[15px] text-body">{a.body}</p>
                  <div className="mt-1.5 flex gap-3 text-[12px] font-semibold">
                    {a.attachment && <button className="text-ink underline" onClick={() => openFile(a.attachment!).catch((e) => toast(e.message, "error"))}>Attachment</button>}
                    {!a.is_platform && <button className="text-pink-fg" onClick={() => remove.mutate(a.id)}>Remove</button>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
