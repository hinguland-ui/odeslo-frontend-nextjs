export interface OtpSendResponse {
  message: string;
  expires_in_seconds: number;
  dev_otp?: string | null;
}

export interface AuthResponse {
  /** Always null in the browser: the server keeps the token in an HttpOnly cookie and sets `session` instead. */
  access_token: string | null;
  session?: boolean;
  token_type: string;
  user_type: string | null;
  user_id: number | null;
  status: string | null;
  must_set_password: boolean;
  registration_required: boolean;
  registration_token?: string | null;
}

export interface SocietyAdminProfile {
  id: number;
  society_id: number;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  role: string;
  permissions: string[];
  must_set_password: boolean;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export interface Me {
  user_type: "super_admin" | "society_admin" | "partner" | string;
  id: number;
  name: string;
  mobile: string;
  status: string;
  society_id: number | null;
  role: string | null;
  permissions: string[];
  profile: Record<string, unknown> & { email?: string; designation?: string; must_set_password?: boolean };
}
