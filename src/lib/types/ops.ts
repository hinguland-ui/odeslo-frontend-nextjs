export interface Complaint {
  id: number;
  complaint_no: string;
  society_id: number;
  resident_id: number;
  unit_id: number;
  category: string;
  description: string;
  photo: string | null;
  priority: "low" | "medium" | "high" | "urgent" | string;
  assigned_to: number | null;
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed" | "reopened" | string;
  resolved_at: string | null;
  closed_at: string | null;
  reopened_count: number;
  created_at: string;
  updated_at: string;
}

export interface ComplaintDetail extends Complaint {
  comments: { id: number; author_type: string; author_name: string; comment: string; status_change: string | null; created_at: string }[];
  resident_name: string | null;
  unit_label: string | null;
  assigned_staff_name: string | null;
}

export interface Staff {
  id: number;
  society_id: number;
  name: string;
  mobile: string;
  type: string;
  category: string | null;
  id_proof: string;
  photo: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export interface Announcement {
  id: number;
  society_id: number | null;
  title: string;
  body: string;
  category: "notice" | "event" | "meeting" | "emergency" | "general" | string;
  attachment: string | null;
  is_pinned: boolean;
  created_by_type: string;
  created_at: string;
  is_platform: boolean;
}

export interface Masjid {
  id: number;
  name: string;
  address: string;
  area: string | null;
  city: string | null;
  lat: number;
  lng: number;
  contact: string | null;
  imam_name: string | null;
  photo: string | null;
  has_ladies_section: boolean;
  has_parking: boolean;
  society_id: number | null;
  added_by_type: string;
  is_suggestion: boolean;
  verified: boolean;
  status: string;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface MasjidTiming {
  id: number;
  masjid_id: number;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string | null;
  effective_from: string;
  verified: boolean;
  status: string;
  rejection_reason: string | null;
  submitted_by_type: string;
  created_at: string;
}

export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "jummah";

export interface Timetable {
  masjid: Masjid | null;
  date: string;
  source: string;
  timings: Partial<Record<PrayerKey, string | null>>;
  sunrise: string | null;
  current_prayer: string | null;
  next_prayer: { name: string; time: string } | null;
  calculation_method: string | null;
}

export interface Setting {
  key: string;
  value: Record<string, unknown>;
}

export interface Notification {
  id: number;
  category: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  society_id: number | null;
  user_type: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: number | null;
  created_at: string;
}

export interface StorageRow {
  society_id: number;
  name: string;
  code: string;
  status: string;
  files: number;
  bytes: number;
  by_category: Record<string, { files: number; bytes: number }>;
}

export interface StorageUsage {
  total_bytes: number;
  total_files: number;
  societies: StorageRow[];
  platform: { files: number; bytes: number; by_category: Record<string, { files: number; bytes: number }> };
}
