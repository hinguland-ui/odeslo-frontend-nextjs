import { api } from "./client";

export type DraftRole = "resident" | "partner";
export interface Draft<T = Record<string, unknown>> {
  /** 0 = nothing saved yet. */
  step: number;
  data: T;
}

/**
 * Where a new resident / vendor stopped in the sign-up wizard (typed details only, never files).
 * Stored on the server against the mobile, so coming back later, even from another device, resumes there.
 */
export const onboardingApi = {
  get: <T = Record<string, unknown>>(role: DraftRole, token: string) => api.getAs<Draft<T>>("/onboarding/draft", token, { role }),
  save: (role: DraftRole, step: number, data: Record<string, unknown>, token: string) => api.putAs<Draft>("/onboarding/draft", { role, step, data }, token),
};
