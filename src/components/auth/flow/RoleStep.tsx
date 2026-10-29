"use client";

import clsx from "clsx";
import type { AdminRole } from "@/lib/auth/session";
import { FlowHeader } from "./FlowHeader";
import { ROLES } from "./roles";

/** Step 1: pick who you are. One tap goes to the mobile number step. */
export function RoleStep({ onPick }: { onPick: (role: AdminRole) => void }) {
  return (
    <>
      <FlowHeader title="Welcome," light="who is signing in?" subtitle="Choose how you use Odeslo. You will only see the screens for your role." />
      <div className="space-y-2.5">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className="group flex w-full items-center gap-3.5 rounded-[20px] border border-line bg-white p-3.5 text-left transition hover:border-ink hover:shadow-sm"
          >
            <span className={clsx("grid size-11 shrink-0 place-items-center rounded-[14px]", r.tile)}>{r.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-[19px] text-ink">{r.title}</span>
              <span className="block text-[13px] leading-[18px] text-muted">{r.desc}</span>
            </span>
            <span className="text-[16px] text-arrow transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden>→</span>
          </button>
        ))}
      </div>
    </>
  );
}
