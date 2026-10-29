import type { Tone } from "./tones";
import { sentence } from "./format";

/** Status -> badge tone + label, shared by every table in both panels. */
const MAP: Record<string, [Tone, string?]> = {
  // generic
  active: ["green", "Active"],
  inactive: ["gray", "Inactive"],
  pending: ["yellow", "Pending"],
  suspended: ["pink", "Suspended"],
  verified: ["green", "Verified"],
  rejected: ["pink", "Rejected"],
  deactivated: ["gray", "Deactivated"],
  pending_approval: ["yellow", "Pending"],
  pending_verification: ["yellow", "Pending"],
  // deals
  draft: ["gray", "Draft"],
  published: ["green", "Live"],
  full: ["lilac", "Full"],
  closed: ["blue", "Closed"],
  // bookings
  pending_payment: ["blue", "Booked"],
  confirmed: ["green", "Confirmed"],
  waitlisted: ["yellow", "Waitlisted"],
  completed: ["lilac", "Completed"],
  cancelled: ["pink", "Cancelled"],
  // payments
  success: ["green", "Success"],
  failed: ["pink", "Failed"],
  initiated: ["yellow", "Pending"],
  refunded: ["lilac", "Refunded"],
  // refunds
  requested: ["yellow", "Requested"],
  approved: ["blue", "Approved"],
  processed: ["lilac", "Processing"],
  // bills
  generated: ["blue", "Generated"],
  due: ["yellow", "Due"],
  paid: ["green", "Paid"],
  overdue: ["pink", "Overdue"],
  partially_paid: ["peach", "Part paid"],
  // complaints & jobs
  open: ["pink", "Open"],
  assigned: ["yellow", "Assigned"],
  in_progress: ["lilac", "In progress"],
  resolved: ["green", "Resolved"],
  reopened: ["pink", "Reopened"],
  created: ["gray", "Created"],
  accepted: ["blue", "Accepted"],
  on_the_way: ["blue", "On the way"],
  started: ["lilac", "Started"],
  rescheduled: ["yellow", "Rescheduled"],
  // priority
  urgent: ["pink", "Urgent"],
  high: ["peach", "High"],
  medium: ["yellow", "Medium"],
  low: ["gray", "Low"],
};

export function statusTone(status?: string | null): Tone {
  return MAP[status ?? ""]?.[0] ?? "gray";
}

export function statusLabel(status?: string | null): string {
  return MAP[status ?? ""]?.[1] ?? sentence(status);
}
