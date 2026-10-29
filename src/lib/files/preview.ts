export const PREVIEW_EVENT = "odeslo:preview-file";

export interface PreviewDetail {
  url: string;
  mime: string;
  title: string;
}

/** Ask the page to show a file in the preview modal. */
export function showPreview(detail: PreviewDetail) {
  window.dispatchEvent(new CustomEvent<PreviewDetail>(PREVIEW_EVENT, { detail }));
}
