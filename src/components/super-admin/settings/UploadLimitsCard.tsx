"use client";

import clsx from "clsx";
import { Badge, Panel } from "@/components/ui";
import { SettingRow } from "./SettingRow";

const IMAGE = ["jpg", "png", "webp"];
const DOCUMENT = ["pdf", "jpg", "png", "webp"];
const HARD_MAX = 25;

function Formats({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (f: string) => {
    const next = value.includes(f) ? value.filter((x) => x !== f) : [...value, f];
    if (next.length) onChange(options.filter((o) => next.includes(o))); // at least one format must stay on
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((f) => (
        <button key={f} type="button" onClick={() => toggle(f)} className={clsx("h-[30px] rounded-[15px] px-3.5 text-[12px] font-bold transition", value.includes(f) ? "bg-ink text-white" : "bg-white text-body hover:bg-mist")}>
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Super admin: how big and which formats photos and documents may be, for every upload in every panel and the app. */
export function UploadLimitsCard({ current, onChange }: { current: (field: string) => unknown; onChange: (field: string, v: unknown) => void }) {
  const imageFormats = (current("image_formats") as string[] | undefined) ?? IMAGE;
  const documentFormats = (current("document_formats") as string[] | undefined) ?? DOCUMENT;
  return (
    <Panel variant="tone" tone="peach" className="min-h-[348px]">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold leading-[19px] text-ink">File uploads</h2>
        <Badge tone="gray" className="!bg-white">Max {HARD_MAX} MB</Badge>
      </div>
      <div className="space-y-2.5">
        <SettingRow def={{ key: "uploads", field: "max_image_mb", label: "Max photo size (MB)", kind: "number" }} value={current("max_image_mb")} onChange={(v) => onChange("max_image_mb", Math.max(1, Math.min(HARD_MAX, Number(v) || 1)))} />
        <SettingRow def={{ key: "uploads", field: "max_document_mb", label: "Max document size (MB)", kind: "number" }} value={current("max_document_mb")} onChange={(v) => onChange("max_document_mb", Math.max(1, Math.min(HARD_MAX, Number(v) || 1)))} />
        <div className="rounded-[14px] bg-white px-3.5 py-3">
          <p className="mb-2 text-[13px] leading-4 text-body">Photo formats <span className="text-muted">(profile, complaint, deal, job photos)</span></p>
          <Formats options={IMAGE} value={imageFormats} onChange={(v) => onChange("image_formats", v)} />
        </div>
        <div className="rounded-[14px] bg-white px-3.5 py-3">
          <p className="mb-2 text-[13px] leading-4 text-body">Document formats <span className="text-muted">(ID proofs, ownership proofs, attachments)</span></p>
          <Formats options={DOCUMENT} value={documentFormats} onChange={(v) => onChange("document_formats", v)} />
        </div>
        <p className="px-1 text-[11px] leading-[14px] text-body">
          Checked in the browser before upload and again on the server. Every file is also opened and verified, photos are re-saved without GPS / camera data, PDFs with scripts are refused, and everything is stored encrypted.
        </p>
      </div>
    </Panel>
  );
}
