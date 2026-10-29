import type { AdminRole } from "@/lib/auth/session";

/**
 * What a new resident / vendor needs to carry on after a page refresh: who they are, their verified mobile and the
 * short-lived registration pass (30 minutes). Kept in sessionStorage: it lives in this tab only, survives a refresh,
 * and is gone when the tab closes, on sign-out of the flow, or when the pass runs out.
 */
const KEY = "odeslo.signup";

export interface SignupResume {
  role: AdminRole;
  mobile: string;
  token: string;
}

function expiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    return Number(payload.exp) * 1000;
  } catch {
    return 0;
  }
}

export function saveResume(r: SignupResume) {
  try { sessionStorage.setItem(KEY, JSON.stringify(r)); } catch { /* private mode: refresh just starts again */ }
}

export function clearResume() {
  try { sessionStorage.removeItem(KEY); } catch { /* nothing stored */ }
}

/** The saved sign-up, or null when there is none, it is for another role, or its pass has expired. */
export function loadResume(role?: AdminRole | null): SignupResume | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as SignupResume;
    if (!r.token || expiry(r.token) < Date.now() + 15_000 || (role && r.role !== role)) {
      clearResume();
      return null;
    }
    return r;
  } catch {
    return null;
  }
}
