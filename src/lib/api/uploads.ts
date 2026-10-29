import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export interface UploadLimits {
  max_image_mb: number;
  max_document_mb: number;
  image_formats: string[];
  document_formats: string[];
  hard_max_mb: number;
}

export const FALLBACK_LIMITS: UploadLimits = {
  max_image_mb: 5,
  max_document_mb: 8,
  image_formats: ["jpg", "png", "webp"],
  document_formats: ["pdf", "jpg", "png", "webp"],
  hard_max_mb: 25,
};

export type UploadKind = "image" | "document";

const FORMAT_OF_MIME: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

/** The limits the super admin set (sizes and allowed formats). The server enforces them again on upload. */
export function useUploadLimits() {
  const q = useQuery({ queryKey: ["upload-limits"], queryFn: () => api.get<UploadLimits>("/settings/upload-limits"), staleTime: 60_000 });
  return q.data ?? FALLBACK_LIMITS;
}

/** Returns an error message when the file breaks a limit, otherwise null. */
export function checkFile(file: File, kind: UploadKind, limits: UploadLimits): string | null {
  const format = FORMAT_OF_MIME[file.type] ?? "";
  const allowed = kind === "image" ? limits.image_formats : limits.document_formats;
  if (!format || !allowed.includes(format)) return `${file.name || "This file"} is not allowed. Use ${allowed.map((f) => f.toUpperCase()).join(", ")}.`;
  const max = kind === "image" ? limits.max_image_mb : limits.max_document_mb;
  if (file.size > max * 1024 * 1024) return `${file.name || "This file"} is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${max} MB.`;
  if (file.size === 0) return "This file is empty.";
  return null;
}

export const formatLabel = (file: File) => (FORMAT_OF_MIME[file.type] ?? file.name.split(".").pop() ?? "file").toUpperCase();
