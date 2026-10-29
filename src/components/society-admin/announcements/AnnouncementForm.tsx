"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button, Eyebrow, Field, Input, Panel, Textarea } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { announcementsApi } from "@/lib/api/ops";
import { Check } from "lucide-react";

const CATEGORIES = [
  { value: "notice", label: "Notice" },
  { value: "event", label: "Event" },
  { value: "emergency", label: "Important" },
  { value: "meeting", label: "Meeting" },
  { value: "general", label: "General" },
];

function Pill({ on, onClick, children, tone = "dark" }: { on: boolean; onClick: () => void; children: React.ReactNode; tone?: "dark" | "green" }) {
  return (
    <button type="button" onClick={onClick}
      className={clsx("h-[31px] rounded-[15.5px] px-3 text-[12px] font-semibold transition",
        on ? (tone === "green" ? "bg-green-bg text-green-fg" : "bg-ink text-white") : "bg-mist text-ink hover:bg-line")}>
      {children}
    </button>
  );
}

/** New announcement: category, title, message, channels, optional attachment. */
export function AnnouncementForm({ homes }: { homes: number }) {
  const [category, setCategory] = useState("notice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const post = useAction(() => {
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("body", body.trim());
    fd.append("category", category);
    fd.append("is_pinned", String(pinned));
    fd.append("push", String(push));
    fd.append("sms", String(sms));
    if (file) fd.append("attachment", file);
    return announcementsApi.create(fd);
  }, {
    success: "Announcement posted",
    invalidate: [["announcements"]],
    onSuccess: () => { setTitle(""); setBody(""); setFile(null); setPinned(false); },
  });

  return (
    <Panel className="flex min-h-[726px] flex-col">
      <Eyebrow className="text-muted">New announcement</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => <Pill key={c.value} on={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</Pill>)}
      </div>
      <Field label="Title" className="mt-3.5">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="!h-12 !rounded-[16px] !px-4 !text-[15px]" placeholder="Water supply shutdown" />
      </Field>
      <Field label="Message" className="mt-3.5">
        <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} className="!rounded-[16px] !px-4 !text-[14px] !leading-[21px]" placeholder="Tank cleaning on Friday from 10 AM to 2 PM…" />
      </Field>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-muted">Send to</p>
          <div className="flex flex-wrap gap-1.5"><Pill on onClick={() => {}}>All residents</Pill></div>
        </div>
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-muted">Channels</p>
          <div className="flex flex-wrap gap-1.5">
            <Pill tone="green" on={push} onClick={() => setPush(!push)}>{push && <Check size={13} strokeWidth={3} className="mr-1 inline" />}Push</Pill>
            <Pill tone="green" on={sms} onClick={() => setSms(!sms)}>{sms && <Check size={13} strokeWidth={3} className="mr-1 inline" />}SMS</Pill>
            <Pill on={pinned} onClick={() => setPinned(!pinned)}>Pin</Pill>
          </div>
        </div>
      </div>
      <label className="mt-3.5 flex h-[42px] cursor-pointer items-center justify-between rounded-[16px] border border-dashed border-dash px-3.5 text-[13px] text-body">
        <span className="truncate">{file ? file.name : "Attach PDF or image (optional)"}</span>
        {file && <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="text-[12px] font-semibold text-pink-fg">Remove</button>}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <div className="mt-auto pt-6">
        <Button size="lg" block disabled={title.trim().length < 3 || body.trim().length < 3} loading={post.isPending} onClick={() => post.mutate(undefined)}>
          Post to {homes} home{homes === 1 ? "" : "s"} now
        </Button>
      </div>
    </Panel>
  );
}
