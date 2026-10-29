import { HOME_BY_ROLE, isAdminRole, type AdminRole } from "@/lib/auth/session";
import type { AuthResponse } from "@/lib/types/auth";

/** The server already put the login in an HttpOnly cookie; check it is the expected role and return where to go next. */
export function finishLogin(res: AuthResponse, expected: AdminRole): string {
  if (!res.session || !isAdminRole(res.user_type) || res.user_type !== expected) {
    throw new Error("This account cannot open the admin panel.");
  }
  const next = new URLSearchParams(window.location.search).get("next");
  const prefix = expected === "society_admin" ? "/society" : expected === "partner" ? "/vendor" : expected === "resident" ? "/resident" : "/admin";
  return next && next.startsWith(prefix) ? next : HOME_BY_ROLE[expected];
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
