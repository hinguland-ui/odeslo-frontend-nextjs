import { API_URL } from "@/lib/config";
import { clearSession } from "@/lib/auth/session";
import { showPreview } from "@/lib/files/preview";

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: unknown) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  form?: FormData;
  auth?: boolean;
  /** Use this bearer token instead of the stored session (registration token). */
  token?: string;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  return url.toString();
}

function readError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const loc = Array.isArray(d?.loc) ? d.loc.filter((x: unknown) => x !== "body").join(".") : "";
          return loc ? `${loc}: ${d?.msg}` : d?.msg;
        })
        .join(", ");
    }
  }
  return fallback;
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  // The login itself is an HttpOnly cookie the server adds. Only a registration token (new number, no login yet) is sent from here.
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), { method, headers, body });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your internet and try again.");
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    if (res.status === 401 && opts.auth !== false && typeof window !== "undefined") {
      clearSession().finally(() => {
        if (!window.location.pathname.startsWith("/login")) window.location.href = "/login?expired=1";
      });
    }
    throw new ApiError(res.status, readError(data, `Request failed (${res.status})`), data);
  }
  return data as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown, query?: Query) => request<T>("POST", path, { body: body ?? {}, query }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  del: <T>(path: string) => request<T>("DELETE", path),
  form: <T>(path: string, form: FormData) => request<T>("POST", path, { form }),
  getAs: <T>(path: string, token: string, query?: Query) => request<T>("GET", path, { query, token }),
  putAs: <T>(path: string, body: unknown, token: string) => request<T>("PUT", path, { body, token }),
  postAs: <T>(path: string, body: unknown, token: string) => request<T>("POST", path, { body, token }),
  formAs: <T>(path: string, form: FormData, token: string) => request<T>("POST", path, { form, token }),
  public: <T>(method: string, path: string, body?: unknown) => request<T>(method, path, { body, auth: false }),
  /** Raw download (CSV exports) with the auth header. */
  async download(path: string, query: Query, filename: string) {
    const res = await fetch(buildUrl(path, query));
    if (!res.ok) throw new ApiError(res.status, `Export failed (${res.status})`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

/**
 * Opens an uploaded file in the preview modal. The file is fetched with the login token and shown from memory:
 * it has no public link and is not saved to disk. The server only returns it if this user may open it.
 */
export async function openFile(path: string) {
  const res = await fetch(`${API_URL}/files/${path}`);
  if (!res.ok) throw new ApiError(res.status, res.status === 404 ? "File not found, or you do not have access to it" : `Could not open file (${res.status})`);
  const blob = await res.blob();
  showPreview({ url: URL.createObjectURL(blob), mime: blob.type, title: fileTitle(res.headers.get("Content-Disposition"), blob.type) });
}

/** The file's own name from the response header; uploads from before names were kept get "Photo" / "Document". */
function fileTitle(disposition: string | null, mime: string): string {
  const star = disposition && /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (star) {
    try { return decodeURIComponent(star[1]!); } catch { /* fall through */ }
  }
  const plain = disposition && /filename="([^"]+)"/i.exec(disposition);
  if (plain) return plain[1]!;
  const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" } as Record<string, string>)[mime];
  return `${mime.startsWith("image/") ? "Photo" : "Document"}${ext ? `.${ext}` : ""}`;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
