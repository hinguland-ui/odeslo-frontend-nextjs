/**
 * Browser session for the web portal.
 *
 * The login token is NOT kept here. It sits in an HttpOnly cookie that only the server (src/app/api/proxy) can read,
 * so page scripts, browser extensions and an injected script cannot copy it. The page only knows the role
 * (a plain cookie set by the server) to show the right panel; the backend checks every request on its own.
 */
export type AdminRole = "society_admin" | "super_admin" | "partner" | "resident";

export const ROLE_COOKIE = "odeslo_role";
export const SESSION_COOKIE = "odeslo_session";

export const HOME_BY_ROLE: Record<AdminRole, string> = {
  society_admin: "/society/dashboard",
  super_admin: "/admin/dashboard",
  partner: "/vendor/dashboard",
  resident: "/resident/home",
};

/** The signed-in role, or null. Read from the plain role cookie the server sets at login. */
export function getRole(): AdminRole | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.split("; ").find((c) => c.startsWith(`${ROLE_COOKIE}=`));
  const v = m ? decodeURIComponent(m.split("=")[1] ?? "") : "";
  return isAdminRole(v) ? v : null;
}

export const isSignedIn = () => getRole() !== null;

/** Forget this browser's login: the server removes the HttpOnly cookie. */
export async function clearSession(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch {
    /* offline: the cookie ends by itself */
  }
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "society_admin" || value === "super_admin" || value === "partner" || value === "resident";
}
