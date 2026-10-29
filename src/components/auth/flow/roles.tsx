import type { ReactNode } from "react";
import type { AdminRole } from "@/lib/auth/session";

export interface RoleInfo {
  id: AdminRole;
  title: string;
  desc: string;
  tile: string;
  icon: ReactNode;
  /** Roles that can create their own account from the login screen. */
  selfSignup?: boolean;
}

const svg = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

export const ROLES: RoleInfo[] = [
  {
    id: "resident",
    title: "Resident",
    desc: "Book group deals, pay maintenance, raise complaints.",
    tile: "bg-blue-bg text-blue-fg",
    selfSignup: true,
    icon: svg(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></>),
  },
  {
    id: "partner",
    title: "Vendor",
    desc: "Get deals from societies, manage jobs and earnings.",
    tile: "bg-green-bg text-green-fg",
    selfSignup: true,
    icon: svg(<><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-2z" /></>),
  },
  {
    id: "society_admin",
    title: "Society admin",
    desc: "Run your society: residents, deals, billing, staff.",
    tile: "bg-peach-bg text-peach-fg",
    icon: svg(<><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20.5v-4h3v4" /></>),
  },
  {
    id: "super_admin",
    title: "Super admin",
    desc: "Odeslo platform team: societies, vendors, settlements.",
    tile: "bg-lilac-bg text-lilac-fg",
    icon: svg(<><path d="M12 3 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" /><path d="m9 12 2 2 4-4" /></>),
  },
];

export const roleOf = (id: AdminRole) => ROLES.find((r) => r.id === id)!;

/** Which login methods each role has. */
export const SUPPORTS_PASSWORD: Partial<Record<AdminRole, true>> = { society_admin: true, super_admin: true };
