export type DealStatus = "draft" | "published" | "full" | "closed" | "completed" | "cancelled";

export interface Deal {
  id: number;
  society_id: number | null;
  title: string;
  category: string;
  subcategory?: string | null;
  description: string | null;
  image: string | null;
  service_date: string;
  slots: string[];
  price_per_unit: number;
  max_units: number;
  confirmed_units: number;
  cutoff_date: string;
  cancel_policy: string | null;
  pay_later_allowed: boolean;
  auto_promote_waitlist: boolean;
  partner_id: number | null;
  status: DealStatus;
  cancel_reason: string | null;
  published_at: string | null;
  created_at: string;
  available_units: number;
  waitlist_count: number;
  is_booking_open: boolean;
  partner_payout_per_unit: number | null;
  created_by_type: string;
}

export interface DealCreate {
  society_id?: number | null;
  title: string;
  category: string;
  subcategory?: string | null;
  description?: string | null;
  service_date: string;
  slots: string[];
  price_per_unit: number;
  max_units: number;
  cutoff_date: string;
  cancel_policy?: string | null;
  pay_later_allowed: boolean;
  auto_promote_waitlist: boolean;
  partner_id?: number | null;
  partner_payout_per_unit?: number | null;
}

export interface Booking {
  id: number;
  booking_no: string;
  deal_id: number;
  society_id: number;
  resident_id: number;
  unit_id: number;
  units_count: number;
  slot: string | null;
  amount: number;
  status: "pending_payment" | "confirmed" | "waitlisted" | "completed" | "cancelled" | string;
  payment_status: "unpaid" | "paid" | "refund_pending" | "refunded" | string;
  waitlist_position: number | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  booked_by_type: string;
  created_at: string;
  deal_title: string | null;
  service_date: string | null;
  deal_category: string | null;
}

export interface ServiceJob {
  id: number;
  job_no: string;
  booking_id: number | null;
  deal_id: number | null;
  /** Empty once the society was deleted: the job stays as the vendor's history. */
  society_id: number | null;
  society_name?: string | null;
  resident_id: number | null;
  unit_id: number | null;
  title: string;
  assigned_to_type: "staff" | "partner" | null;
  assigned_to_id: number | null;
  status: string;
  scheduled_at: string | null;
  slot: string | null;
  completed_at: string | null;
  notes: string | null;
  issue_note: string | null;
  photo?: string | null;
  feedback?: string | null;
  escalated: boolean;
  rating: number | null;
  created_at: string;
  payout_amount: number | null;
  payout_status: "not_applicable" | "pending" | "paid" | string;
  payout_reference: string | null;
}

export interface ServiceJobDetail extends ServiceJob {
  timeline: { id: number; status: string; note: string | null; photo?: string | null; updated_by_type: string; created_at: string }[];
  resident_name: string | null;
  resident_mobile: string | null;
  unit_label: string | null;
  assignee_name: string | null;
}

export interface Partner {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  business_name: string | null;
  gst: string | null;
  categories: string[];
  id_proof: string;
  photo: string;
  verified: boolean;
  verified_at: string | null;
  rating_avg: number;
  rating_count: number;
  status: string;
  created_at: string;
  society_ids: number[];
  bank_details?: Record<string, string> | null;
}

export interface PartnerBrief {
  id: number;
  name: string;
  business_name: string | null;
  categories: string[];
  rating_avg: number;
  rating_count: number;
}

export interface Earnings {
  completed_jobs: number;
  total_earned: number;
  paid: number;
  pending: number;
}

/** A society assigned to the logged-in vendor, with how many vendors serve it (counts only). */
export interface PartnerSociety {
  id: number;
  name: string;
  area: string;
  city: string;
  assigned_at: string | null;
  vendors_total: number;
  vendors_same_category: number;
  vendors_by_category: Record<string, number>;
  open_deals: number;
  my_jobs: number;
}

/** A vendor's application to serve a deal. */
export interface DealApplication {
  id: number;
  deal_id: number;
  partner_id: number;
  quote_per_unit: number | null;
  message: string | null;
  status: "applied" | "accepted" | "rejected" | "withdrawn" | string;
  created_at: string;
}

export interface DealApplicationAdmin extends DealApplication {
  partner_name: string | null;
  business_name: string | null;
  rating_avg: number;
  rating_count: number;
}

/** One deal a vendor applied to (super admin view). */
export interface PartnerApplication {
  id: number;
  deal_id: number;
  deal_title: string;
  society_id: number | null;
  category: string;
  quote_per_unit: number | null;
  message: string | null;
  status: "applied" | "accepted" | "rejected" | "withdrawn" | string;
  created_at: string;
}
