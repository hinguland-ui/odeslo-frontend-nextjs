"use client";

import { useState } from "react";
import { Button, DateTimePicker, Field, Input, Modal, Textarea } from "@/components/ui";

/** Report a problem and optionally ask to reschedule. The society admin is notified. */
export function JobIssueModal({
  open,
  title,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (note: string, rescheduleTo?: string) => void;
}) {
  const [note, setNote] = useState("");
  const [when, setWhen] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report issue / reschedule"
      subtitle={title}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button variant="warn" loading={loading} disabled={note.trim().length < 3} onClick={() => onConfirm(note.trim(), when || undefined)}>
            Send to admin
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="What is the problem?">
          <Textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Need a spare part, resident not at home" />
        </Field>
        <Field label="Preferred new time (optional)">
          <DateTimePicker value={when} onChange={setWhen} />
        </Field>
      </div>
    </Modal>
  );
}
