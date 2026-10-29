import { api } from "./client";

export interface SocietyDashboard {
  residents: { count: number };
  pending_approvals: { count: number };
  units: { total: number; vacant: number };
  active_bookings: { count: number; confirmed: number; waitlisted: number; pending_payment: number };
  maintenance: { collected: number; pending: number; overdue_bills: number };
  open_complaints: number;
  open_requests: number;
  todays_service_jobs: number;
  pending_refunds: number;
  active_deals: number;
}

export interface SuperDashboard {
  societies: { total: number; active: number; pending: number; suspended: number };
  residents: number;
  pending_residents: number;
  active_deals: number;
  active_bookings: number;
  confirmed_bookings: number;
  revenue: number;
  revenue_by_type: { booking: number; maintenance: number };
  refunded: number;
  pending_refunds: number;
  pending_masjid_verifications: number;
  escalated_jobs: number;
  unverified_partners: number;
}

export interface BookingsReportRow { society_id: number; status: string; bookings: number; units: number; amount: number }
export interface RevenueReportRow { date: string; ref_type: string; mode: string; payments: number; amount: number }
export interface MaintenanceReportRow { period: string; status: string; bills: number; billed: number; collected: number }
export interface JobsReportRow { assignee_type: string | null; assignee_id: number | null; status: string; jobs: number; avg_rating: number | null }

type Range = { society_id?: number; date_from?: string; date_to?: string };

export const dashboardApi = {
  society: () => api.get<SocietyDashboard>("/dashboard/society-admin"),
  super: () => api.get<SuperDashboard>("/dashboard/super-admin"),
  bookingsReport: (q: Range = {}) => api.get<BookingsReportRow[]>("/reports/bookings", q),
  revenueReport: (q: Range = {}) => api.get<RevenueReportRow[]>("/reports/revenue", q),
  maintenanceReport: (society_id?: number) => api.get<MaintenanceReportRow[]>("/reports/maintenance", { society_id }),
  jobsReport: (society_id?: number) => api.get<JobsReportRow[]>("/reports/service-jobs", { society_id }),
};
