"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { checkFile, formatLabel, useUploadLimits, type UploadKind } from "@/lib/api/uploads";
import { formatBytes } from "@/lib/utils/format";
import { FilePreviewModal } from "./FilePreview";
import { Check, X } from "lucide-react";

const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" } as Record<string, string>;
const BOX = "flex min-h-11 w-full items-center gap-2.5 rounded-[14px] bg-mist px-[14px] text-[13px] font-semibold leading-[16.5px] text-ink";

/**
 * File picker for every form. It checks the super admin's limits (formats, MB) before anything is sent, shows a
 * preview with a green tick, the format and the size, opens a bigger preview on click, and lets the user remove it.
 * The file stays in the browser until the form itself is saved, so closing or refreshing the page uploads nothing.
 */
export function FileInput({
  file,
  onChange,
  accept,
  placeholder = "Choose file",
  kind,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  /** Only used to guess the kind: "image/*" means photos, anything with pdf means documents. */
  accept?: string;
  placeholder?: string;
  kind?: UploadKind;
}) {
  const limits = useUploadLimits();
  const k: UploadKind = kind ?? (accept && accept.startsWith("image/") && !accept.includes("pdf") ? "image" : "document");
  const formats = k === "image" ? limits.image_formats : limits.document_formats;
  const maxMb = k === "image" ? limits.max_image_mb : limits.max_document_mb;
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const problem = checkFile(f, k, limits);
    if (input.current) input.current.value = ""; // allows choosing the same file again
    if (problem) return setError(problem);
    setError("");
    onChange(f);
  };

  const isImage = !!file && file.type.startsWith("image/");

  return (
    <div>
      {file ? (
        <div className={clsx(BOX, "py-2")}>
          <button type="button" onClick={() => setOpen(true)} className="relative shrink-0" aria-label="Preview file">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="size-10 rounded-[10px] object-cover" />
            ) : (
              <span className="grid size-10 place-items-center rounded-[10px] bg-pink-bg text-[10px] font-extrabold text-pink-fg">PDF</span>
            )}
            <span className="absolute -bottom-1 -right-1 grid size-[18px] place-items-center rounded-full bg-green-fg text-white ring-2 ring-mist"><Check size={11} strokeWidth={3.4} /></span>
          </button>
          <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
            <span className="block truncate">{file.name}</span>
            <span className="block text-[11px] font-medium text-muted">{formatLabel(file)} · {formatBytes(file.size)} · tap to preview</span>
          </button>
          <button type="button" onClick={() => { onChange(null); setError(""); }} className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[12px] text-body hover:bg-line" aria-label="Remove file"><X size={14} /></button>
        </div>
      ) : (
        <label className={clsx(BOX, "h-11 cursor-pointer justify-between")}>
          <span className="min-w-0 truncate font-medium text-hint">
            {placeholder}
            <span className="ml-2 text-[11px] font-medium">{formats.map((f) => f.toUpperCase()).join(" · ")} · max {maxMb} MB</span>
          </span>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">Browse</span>
          <input ref={input} type="file" accept={formats.map((f) => MIME[f]).join(",")} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
      )}
      {error && <p role="alert" className="mt-1.5 text-[11px] font-semibold leading-[14px] text-pink-fg">{error}</p>}
      {file && <FilePreviewModal open={open} onClose={() => setOpen(false)} url={url} mime={file.type} title={file.name} />}
    </div>
  );
}
