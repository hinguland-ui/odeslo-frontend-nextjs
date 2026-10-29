"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { residentApi } from "@/lib/api/resident";
import { initials } from "@/lib/utils/format";
import { Check, ChevronDown } from "lucide-react";

const STATUS: Record<string, { tone: "green" | "yellow" | "pink"; label: string }> = {
  active: { tone: "green", label: "Approved" },
  pending_approval: { tone: "yellow", label: "Waiting" },
  rejected: { tone: "pink", label: "Rejected" },
};

/**
 * The society + flat chip at the top of the menu. Click it to see every home of this login (other flats, other
 * societies) and switch. Switching signs in as the same person in that home, so every page then shows its data.
 */
export function HomeSwitcher({ society, flat }: { society?: string; flat?: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const homes = useQuery({ queryKey: ["resident", "homes"], queryFn: residentApi.homes });
  const list = homes.data ?? [];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const swap = useAction((id: number) => residentApi.switchHome(id), {
    onSuccess: () => {
      // the server has already swapped the login cookie to the other home
      qc.clear(); // nothing from the previous home may stay on screen
      window.location.href = "/resident/home";
    },
  });

  const waiting = list.filter((h) => h.status === "pending_approval").length;

  return (
    <div ref={box} className="relative mt-[18px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-[54px] w-full items-center gap-2.5 rounded-[14px] bg-blue-bg px-2.5 text-left transition hover:brightness-[0.98]"
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-white text-[12px] font-bold text-blue-fg">{initials(society ?? "…")}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold leading-4 text-ink">{society ?? "Loading…"}</span>
          <span className="block truncate text-[11px] leading-[13px] text-muted">{flat ? `Flat ${flat}` : " "}{list.length > 1 ? ` · ${list.length} homes` : ""}</span>
        </span>
        {waiting > 0 && <span className="size-2 shrink-0 rounded-full bg-yellow-fg" title="A home is waiting for approval" />}
        <ChevronDown size={16} className={clsx("shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[60px] z-30 rounded-[18px] border border-line bg-white p-2 shadow-xl animate-slide-up">
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.88px] text-muted">Your homes</p>
          <ul className="max-h-[280px] space-y-0.5 overflow-y-auto scroll-thin">
            {list.map((h) => {
              const st = STATUS[h.status] ?? { tone: "yellow" as const, label: h.status };
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    disabled={h.current || swap.isPending}
                    onClick={() => swap.mutate(h.id)}
                    className={clsx("flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition", h.current ? "bg-mist" : "hover:bg-mist")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold leading-4 text-ink">{h.society_name}</span>
                      <span className="block truncate text-[11px] leading-[13px] text-muted">Flat {h.unit_label} · {h.resident_type}</span>
                    </span>
                    {h.current ? <Check size={16} strokeWidth={2.6} className="text-green-fg" aria-label="Current home" /> : <Badge tone={st.tone} size="sm" dot={false}>{st.label}</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link href="/resident/homes/add" onClick={() => setOpen(false)} className="mt-1 flex h-10 items-center justify-center rounded-[12px] bg-ink text-[12px] font-semibold text-white hover:bg-ink-soft">
            + Add another home
          </Link>
        </div>
      )}
    </div>
  );
}
