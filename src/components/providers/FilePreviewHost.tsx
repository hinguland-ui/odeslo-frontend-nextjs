"use client";

import { useEffect, useState } from "react";
import { FilePreviewModal } from "@/components/ui/FilePreview";
import { PREVIEW_EVENT, type PreviewDetail } from "@/lib/files/preview";

/** Listens for openFile() and shows the downloaded file in a modal (no new tab, nothing is left behind afterwards). */
export function FilePreviewHost() {
  const [file, setFile] = useState<PreviewDetail | null>(null);

  useEffect(() => {
    const on = (e: Event) => setFile((e as CustomEvent<PreviewDetail>).detail);
    window.addEventListener(PREVIEW_EVENT, on);
    return () => window.removeEventListener(PREVIEW_EVENT, on);
  }, []);

  const close = () => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
  };

  return file ? <FilePreviewModal open onClose={close} url={file.url} mime={file.mime} title={file.title} /> : null;
}
