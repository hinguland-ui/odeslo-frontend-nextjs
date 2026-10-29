"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Field, Textarea } from "./Field";
import { Modal } from "./Modal";

/** Asks for a reason before a reject / cancel action. */
export function ReasonModal({
  open,
  title,
  confirmLabel = "Reject",
  placeholder = "Reason",
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  confirmLabel?: string;
  placeholder?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={loading} disabled={reason.trim().length < 3} onClick={() => onConfirm(reason.trim())}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Field label="Reason (shared with the person)">
        <Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder={placeholder} />
      </Field>
    </Modal>
  );
}
