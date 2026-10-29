"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Button, EmptyState, Panel, PanelTitle, Skeleton } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { useMe } from "@/hooks/useMe";
import { liveApi } from "@/lib/api/live";
import { time, titleCase } from "@/lib/utils/format";

const ROLE_LABEL: Record<string, string> = { partner: "Vendor", staff: "Staff", resident: "Resident", society_admin: "Society admin", super_admin: "Odeslo" };

/**
 * Chat of one service job. Resident, vendor and society admin write in the same thread.
 * New messages arrive instantly through the WebSocket (the query is refetched on a "chat" event), with a slow poll as backup.
 */
export function JobChat({ jobId, closed, title = "Chat" }: { jobId: number; closed?: boolean; title?: string }) {
  const me = useMe();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const q = useQuery({ queryKey: ["chat", jobId], queryFn: () => liveApi.messages(jobId), refetchInterval: 30_000, staleTime: 0 });
  const send = useAction((body: string) => liveApi.send(jobId, body), { invalidate: [["chat", jobId]], onSuccess: () => setText("") });

  const list = q.data ?? [];
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [list.length]);

  const mine = (m: { sender_type: string; sender_id: number }) => m.sender_type === me.data?.user_type && m.sender_id === me.data?.id;
  const submit = () => {
    const body = text.trim();
    if (body && !send.isPending) send.mutate(body);
  };

  return (
    <Panel variant="soft" as="section" className="flex flex-col">
      <PanelTitle aside={list.length ? `${list.length} messages` : undefined}>{title}</PanelTitle>
      <div className="max-h-[300px] min-h-[120px] space-y-2 overflow-y-auto rounded-[16px] bg-white p-3 scroll-thin">
        {q.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : list.length === 0 ? (
          <EmptyState title="No messages yet" hint="Ask about timing, access or what to expect." />
        ) : (
          list.map((m) => (
            <div key={m.id} className={clsx("flex flex-col", mine(m) ? "items-end" : "items-start")}>
              <div className={clsx("max-w-[85%] rounded-[16px] px-3 py-2 text-[13px] leading-[17px]", mine(m) ? "rounded-br-[4px] bg-ink text-white" : "rounded-bl-[4px] bg-mist text-ink")}>
                {m.body}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-muted">
                {mine(m) ? "You" : `${m.sender_name} · ${ROLE_LABEL[m.sender_type] ?? titleCase(m.sender_type)}`} · {time(m.created_at)}
              </span>
            </div>
          ))
        )}
        <div ref={end} />
      </div>
      {closed ? (
        <p className="mt-2 text-[11px] text-muted">This job is closed, so the chat is read-only.</p>
      ) : (
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="h-11 min-w-0 flex-1 rounded-[22px] bg-white px-4 text-[13px] font-medium text-ink outline-none placeholder:text-hint focus:ring-2 focus:ring-ink/10"
          />
          <Button type="submit" loading={send.isPending} disabled={!text.trim()}>Send</Button>
        </form>
      )}
    </Panel>
  );
}
