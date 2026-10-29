"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Note, Panel, PanelTitle, Skeleton } from "@/components/ui";
import { societiesApi } from "@/lib/api/societies";
import { JoinQr } from "./JoinQr";
import { Check } from "lucide-react";

/** The society code residents use to find this society while signing up. */
export function JoinCodeCard({ societyId, code, name }: { societyId: number; code: string; name?: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const info = useQuery({ queryKey: ["society", societyId, "join-info"], queryFn: () => societiesApi.joinInfo(societyId) });

  const copy = async (text: string, what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked: the text is still visible to copy by hand */
    }
  };

  return (
    <Panel variant="dark" className="flex flex-col gap-3">
      <PanelTitle className="[&_h2]:text-white">Society code</PanelTitle>
      <p className="text-[12px] leading-4 text-night-muted">Residents choose <strong className="text-white">Resident</strong> on the login page, search your society or enter this code.</p>
      <p className="select-all rounded-[16px] bg-night px-4 py-3 text-center text-[30px] font-extrabold tracking-[0.18em] text-white">{code}</p>
      {info.data && <JoinQr url={info.data.qr_payload} societyName={info.data.name ?? name ?? code} code={code} />}
      <div className="flex gap-2">
        <Button variant="white" className="flex-1" onClick={() => copy(code, "code")}>{copied === "code" ? <span className="inline-flex items-center gap-1">Copied <Check size={14} strokeWidth={3} /></span> : "Copy code"}</Button>
        <Button variant="violet" className="flex-1" disabled={!info.data} onClick={() => info.data && copy(info.data.join_url, "link")}>{copied === "link" ? <span className="inline-flex items-center gap-1">Copied <Check size={14} strokeWidth={3} /></span> : "Copy join link"}</Button>
      </div>
      {info.isLoading && <Skeleton className="h-4 w-full" />}
      {info.data && <Note tone="lilac" className="break-all">{info.data.join_url}</Note>}
    </Panel>
  );
}
