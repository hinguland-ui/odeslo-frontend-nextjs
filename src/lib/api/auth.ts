import { api } from "./client";
import type { AdminRole } from "@/lib/auth/session";
import type { AuthResponse, Me, OtpSendResponse } from "@/lib/types/auth";

export interface ResidentRegisterBody {
  society_id: number;
  wing_id: number;
  unit_id: number;
  resident_type: "owner" | "tenant" | "family";
  name: string;
  email?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_mobile?: string | null;
}

export const authApi = {
  superAdminLogin: (email: string, password: string) =>
    api.public<OtpSendResponse>("POST", "/auth/super-admin/login", { email, password }),
  superAdminVerify: (email: string, otp: string) =>
    api.public<AuthResponse>("POST", "/auth/super-admin/verify", { email, otp }),
  societyAdminPassword: (email: string, password: string) =>
    api.public<AuthResponse>("POST", "/auth/society-admin/login", { email, password }),
  sendOtp: (mobile: string, user_type: AdminRole = "society_admin") =>
    api.public<OtpSendResponse>("POST", "/auth/otp/send", { mobile, user_type }),
  verifyOtp: (mobile: string, otp: string, user_type: AdminRole = "society_admin") =>
    api.public<AuthResponse>("POST", "/auth/otp/verify", { mobile, otp, user_type }),
  /** Vendor self sign-up. `token` is the registration_token returned by OTP verify for a new mobile. */
  registerVendor: (form: FormData, token: string) =>
    api.formAs<{ message: string; verified: boolean }>("/service-partners/register", form, token),
  /** Resident self sign-up (new mobile). Returns a session for the pending resident. */
  registerResident: (body: ResidentRegisterBody, token: string) => api.postAs<AuthResponse>("/residents/register", body, token),
  setPassword: (new_password: string, current_password?: string) =>
    api.post<{ message: string }>("/auth/set-password", { new_password, current_password }),
  me: () => api.get<Me>("/auth/me"),
  logout: () => api.post("/auth/logout", {}),
};
