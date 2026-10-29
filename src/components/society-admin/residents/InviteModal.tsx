"use client";

import { useQuery } from "@tanstack/react-query";
import { Button, KeyValue, Modal, Note } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { api } from "@/lib/api/client";

interface JoinInfo { society_id: number; code: string; name: string; join_url: string; qr_payload: string }

/** Residents join themselves from the app with the society code; admins approve them. */
export function InviteModal({ open, onClose, societyId }: { open: boolean; onClose: () => void; societyId?: number | null }) {
  const toast = useToast();
  const info = useQuery({
    queryKey: ["join-info", societyId],
    queryFn: () => api.get<JoinInfo>(`/societies/${societyId}/join-info`),
    enabled: open && !!societyId,
  });
  const copy = (text: string) => navigator.clipboard.writeText(text).then(() => toast("Copied"));
  const msg = info.data ? `Join ${info.data.name} on Odeslo: ${info.data.join_url} (society code ${info.data.code})` : "";

  return (
    <Modal open={open} onClose={onClose} title="Add residents" subtitle="Share the join link — new residents appear in Approvals"
      footer={<><Button variant="light" onClick={() => copy(info.data?.join_url ?? "")}>Copy link</Button>
        <Button href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>Share on WhatsApp</Button></>}>
      <div className="space-y-2 rounded-[16px] bg-panel p-3.5">
        <KeyValue label="Society code" value={<span className="text-[18px]">{info.data?.code ?? "…"}</span>} />
        <KeyValue label="Join link" value={<span className="break-all font-semibold">{info.data?.join_url ?? "…"}</span>} />
      </div>
      <Note tone="green" className="mt-3">Residents pick their wing and unit while joining. They get Masjid &amp; Namaz until you approve.</Note>
    </Modal>
  );
}
