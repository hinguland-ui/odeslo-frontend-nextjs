import { api } from "./client";

export type GroupBy = "day" | "week" | "month";
export type ReportSection = "revenue" | "societies" | "bookings" | "maintenance" | "complaints" | "residents";

export interface ReportFilters {
  date_from: string;
  date_to: string;
  society_ids: number[];
  category: string;
  mode: string;
  group_by: "" | GroupBy;
}

export interface Point {
  date: string;
  label: string;
  booking: number;
  maintenance: number;
  refunds: number;
  net: number;
  payments: number;
  bookings: number;
  units: number;
  residents: number;
  complaints: number;
  resolved: number;
  jobs: number;
}

export interface NameValue { name: string; value: number }

export interface SocietyRow {
  society_id: number; society: string; code: string; city: string; status: string; units: number; residents_joined: number; deals: number;
  bookings: number; units_booked: number; booking_revenue: number; maintenance_revenue: number; total_revenue: number; refunded: number;
  net_revenue: number; billed: number; collected: number; collection_rate: number; complaints: number; complaints_resolved: number; jobs: number;
}

export interface ReportOverview {
  filters: { date_from: string; date_to: string; society_ids: number[]; societies: string[]; category: string | null; mode: string | null; group_by: GroupBy };
  generated_at: string;
  kpis: {
    gross_revenue: number; booking_revenue: number; maintenance_revenue: number; refunded: number; net_revenue: number; payments: number; failed_payments: number;
    avg_payment: number; bookings: number; units_booked: number; deals_created: number; deals_cancelled: number; maintenance_billed: number; maintenance_collected: number;
    collection_rate: number; residents_joined: number; residents_approved: number; complaints: number; complaints_resolved: number; resolution_rate: number;
    jobs: number; jobs_completed: number; avg_rating: number | null; societies: number;
  };
  timeseries: Point[];
  revenue_by_mode: { name: string; amount: number; count: number }[];
  revenue_by_society: { name: string; booking: number; maintenance: number; total: number }[];
  booking_status: NameValue[];
  refund_status: NameValue[];
  deals_by_category: { category: string; deals: number; bookings: number; units: number; gmv: number }[];
  top_deals: { deal: string; society: string; category: string; units: number; price_per_unit: number; gmv: number; status: string }[];
  maintenance_by_period: { period: string; billed: number; collected: number; bills: number; paid: number; overdue: number; rate: number }[];
  complaints_by_category: NameValue[];
  complaints_by_status: NameValue[];
  complaints_by_priority: NameValue[];
  jobs_by_status: NameValue[];
  rating_distribution: NameValue[];
  residents_by_type: NameValue[];
  residents_by_status: NameValue[];
  vendors: { vendor: string; jobs: number; completed: number; avg_rating: number | null; payout: number }[];
  societies: SocietyRow[];
  payments: { paid_at: string; txn_id: string; society: string; resident: string; type: string; description: string; mode: string; amount: number; reference: string }[];
  payments_truncated: boolean;
  payments_total: number;
}

const query = (f: ReportFilters) => ({
  date_from: f.date_from,
  date_to: f.date_to,
  society_ids: f.society_ids.join(",") || undefined,
  category: f.category || undefined,
  mode: f.mode || undefined,
  group_by: f.group_by || undefined,
});

export const reportsApi = {
  overview: (f: ReportFilters) => api.get<ReportOverview>("/reports/overview", query(f)),
  /** Excel or PDF of exactly what the filters show; with `section` only that one chart (and its table). */
  export: (format: "xlsx" | "pdf", f: ReportFilters, section?: ReportSection) =>
    api.download("/reports/export", { ...query(f), format, section }, `Odeslo-${section ?? "report"}-${f.date_from}-to-${f.date_to}.${format}`),
};
