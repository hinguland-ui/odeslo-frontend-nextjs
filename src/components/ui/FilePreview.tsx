"use client";

import { Modal } from "./Modal";

/** Opens a picked or downloaded file in the page: images are shown, PDFs open in a viewer, with a Download button. */
export function FilePreviewModal({ open, onClose, url, mime, title }: { open: boolean; onClose: () => void; url: string; mime: string; title: string }) {
  const isPdf = mime === "application/pdf";
  return (
    <Modal open={open} onClose={onClose} title={title} width={760} z={95}>
      <div className="overflow-hidden rounded-[16px] bg-mist">
        {isPdf ? (
          <iframe src={url} title={title} className="h-[70vh] w-full border-0" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className="mx-auto max-h-[70vh] w-auto max-w-full object-contain" />
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <a href={url} download={title} className="inline-flex h-[38px] items-center rounded-[19px] bg-mist px-4 text-[13px] font-semibold text-ink hover:bg-line">Download</a>
      </div>
    </Modal>
  );
}
