"use client";

import { useState } from "react";
import { Button, Field, Input, Modal, Textarea, Toggle } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { notificationsApi } from "@/lib/api/ops";

/** In-app (and optional SMS) message to selected residents. */
export function MessageModal({ open, onClose, residentIds, to }: { open: boolean; onClose: () => void; residentIds: number[]; to: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sms, setSms] = useState(false);
  const send = useAction(() => notificationsApi.send({ title, body, target: "residents", resident_ids: residentIds, sms }), {
    success: (r) => `Sent to ${r.recipients} resident${r.recipients === 1 ? "" : "s"}`,
    onSuccess: () => {
      setTitle("");
      setBody("");
      onClose();
    },
  });
  return (
    <Modal open={open} onClose={onClose} title={`Message ${to}`} subtitle="Delivered as an app notification"
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button disabled={!title || !body} loading={send.isPending} onClick={() => send.mutate(undefined)}>Send</Button></>}>
      <div className="space-y-3">
        <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Message"><Textarea value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <label className="flex items-center justify-between rounded-[14px] bg-panel px-3.5 py-2.5 text-[13px] font-semibold">
          Also send SMS <Toggle checked={sms} onChange={setSms} />
        </label>
      </div>
    </Modal>
  );
}
