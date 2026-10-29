export interface MaintenanceSettings {
  amounts: Record<string, number>;
  billing_cycle: "monthly" | "quarterly";
  due_day: number;
  late_fee_enabled: boolean;
  late_fee: number;
}

export type FeatureKey = "group_deals" | "masjid" | "complaints" | "requests" | "maintenance" | "staff" | "announcements";
export type Features = Record<FeatureKey, boolean>;

export interface Society {
  id: number;
  code: string;
  name: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  type: string;
  registration_number: string | null;
  logo: string | null;
  maintenance_settings: MaintenanceSettings;
  features: Features;
  require_documents: boolean;
  status: "pending" | "active" | "suspended";
  created_at: string;
}

export interface SocietyDetail extends Society {
  stats: { wings: number; units: number; occupied_units: number; active_residents: number; pending_residents: number };
}

export interface Wing {
  id: number;
  society_id: number;
  name: string;
}

export interface Unit {
  id: number;
  society_id: number;
  wing_id: number;
  unit_no: string;
  unit_type: string;
  floor: number | null;
  occupancy_status: "vacant" | "owner" | "tenant" | string;
}

export interface SocietyCreate {
  name: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  type: string;
  registration_number?: string | null;
  require_documents: boolean;
  wings: { name: string; units: { unit_no: string; unit_type: string; floor?: number | null }[] }[];
  primary_admin: { name: string; mobile: string; email: string; designation: string };
  maintenance_settings: MaintenanceSettings;
  features: Features;
}

export interface SocietyAdmin {
  id: number;
  society_id: number;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  role: string;
  status: string;
}

export interface SocietyDeletePreview {
  society: { id: number; name: string; code: string; status: string };
  delete: {
    wings: number; flats: number; residents: number; residents_by_status: Record<string, number>; society_admins: number; staff: number;
    deals: number; bookings: number; payments: number; payments_amount: number; refunds: number; maintenance_bills: number;
    complaints: number; requests: number; announcements: number; masjids: number; files: number; files_bytes: number;
  };
  keep: { vendors_assigned: number; vendor_jobs: number; vendor_jobs_open: number; vendor_payouts_pending: number; vendor_payouts_pending_amount: number };
}
