/** Shapes returned to the logged-in resident (web resident portal). */

export interface ResidentHome {
  resident: { id: number; name: string; status: string; resident_type: string; rejection_reason?: string | null };
  society: { id: number; name: string; code: string; logo: string | null; area: string; city: string; lat: number; lng: number; features: Record<string, boolean> };
  unit: { id: number; label: string; type: string };
  unread_notifications: number;
  limited_access: boolean;
  maintenance?: { due: number; due_date: string | null; unpaid_bills: number } | null;
  active_bookings?: number;
  latest_notices?: { id: number; title: string; category: string; created_at: string }[];
}

export interface MySociety {
  society: {
    id: number;
    code: string;
    name: string;
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    logo: string | null;
    type: string;
    status: string;
    registration_number: string | null;
    features: Record<string, boolean>;
  };
  staff: { name: string; type: string; mobile: string }[];
  vendors: { total: number; by_category: Record<string, number> };
  open_deals: number;
  stats: { units: number; wings: number; staff: number };
  committee: { name: string; designation: string; mobile: string | null; email: string | null }[];
}

export interface Bill {
  id: number;
  bill_no: string;
  period: string;
  period_start: string;
  period_end: string;
  amount: number;
  late_fee: number;
  paid_amount: number;
  total_amount: number;
  outstanding: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  unit_label: string | null;
}

export interface MyMaintenance {
  current_due: number;
  next_due_date: string | null;
  unpaid_bills: Bill[];
  history: Bill[];
}

export interface BookingDetail {
  id: number;
  booking_no: string;
  deal_id: number;
  units_count: number;
  slot: string | null;
  amount: number;
  status: string;
  payment_status: string;
  waitlist_position: number | null;
  hold_expires_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  deal_title: string | null;
  service_date: string | null;
  deal_category: string | null;
  deal: Record<string, unknown>;
  payments: { id: number; txn_id: string; amount: number; status: string; mode: string; created_at?: string }[];
  job: { id?: number; job_no?: string; status?: string; assigned_to_id?: number | null; scheduled_at?: string | null; slot?: string | null; assignee_name?: string | null; rating?: number | null } | null;
  refunds: { id: number; amount: number; status: string }[];
  can_cancel: boolean;
  can_pay: boolean;
  can_rate: boolean;
}

export interface PaymentOrder {
  payment_id: number;
  txn_id: string;
  gateway: string;
  gateway_order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  key_id: string;
}

export interface PaymentRow {
  id: number;
  txn_id: string;
  ref_type: string;
  ref_id: number;
  amount: number;
  mode: string;
  status: string;
  created_at: string;
}

export interface Req {
  id: number;
  request_no: string;
  type: string;
  details: string;
  attachment: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  mobile: string | null;
  linked_resident_id: number | null;
}

export interface Vehicle {
  id: number;
  vehicle_type: string;
  vehicle_number: string;
  parking_slot: string | null;
}

export interface PublicSociety {
  id: number;
  code: string;
  name: string;
  area: string;
  city: string;
  lat?: number;
  lng?: number;
  distance_km?: number | null;
}
export interface PublicWing {
  id: number;
  name: string;
}
export interface PublicUnit {
  id: number;
  wing_id: number;
  unit_no: string;
  unit_type: string;
  floor: number | null;
  occupancy_status: string;
}
