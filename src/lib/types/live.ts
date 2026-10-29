/** Chat and live-location shapes of a service job. */
export interface JobMessage {
  id: number;
  job_id: number;
  sender_type: "resident" | "partner" | "staff" | "society_admin" | "super_admin" | string;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface JobLocation {
  /** The vendor is on the job and the position is fresh (last 3 minutes). */
  sharing: boolean;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  updated_at: string | null;
  job_status: string;
  destination: { lat: number; lng: number; label: string } | null;
  distance_km: number | null;
  eta_minutes: number | null;
}

/** Events the server pushes over the WebSocket. */
export type RealtimeEvent =
  | { type: "ready" }
  | { type: "refresh" }
  | { type: "notification"; category: string; title: string; body: string; ref_type?: string | null; ref_id?: number | null }
  | { type: "chat"; job_id: number; message_id: number }
  | { type: "job_location"; job_id: number };

export interface HomeSummary {
  id: number;
  society_id: number;
  society_name: string;
  society_code: string;
  society_area: string;
  wing_name: string | null;
  unit_no: string | null;
  unit_label: string;
  resident_type: string;
  status: string;
  rejection_reason: string | null;
  current: boolean;
}
