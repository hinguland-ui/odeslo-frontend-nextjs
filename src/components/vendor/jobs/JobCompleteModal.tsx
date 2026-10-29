"use client";

import { useState } from "react";
import { Button, Field, FileInput, Modal, Textarea } from "@/components/ui";

/** Completing a job needs proof: a photo, a note, or both (backend rule). */
export function JobCompleteModal({
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
  onConfirm: (note: string, photo: File | null) => void;
}) {
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const ready = note.trim().length >= 3 || !!photo;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mark job complete"
      subtitle={title}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button variant="success" loading={loading} disabled={!ready} onClick={() => onConfirm(note.trim(), photo)}>
            Complete job
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Completion photo" hint="Photo of the finished work (JPG / PNG).">
          <FileInput file={photo} onChange={setPhoto} accept="image/*" placeholder="Choose photo" />
        </Field>
        <Field label="Work note" hint="Add a photo or a note, at least one is required.">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done, parts used, anything the resident should know" />
        </Field>
      </div>
    </Modal>
  );
}
