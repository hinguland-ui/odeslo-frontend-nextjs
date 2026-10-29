import clsx from "clsx";
import { LiveDot } from "@/components/live/LiveDot";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { initials } from "@/lib/utils/format";
import { LogoutButton } from "./LogoutButton";

/**
 * Fixed at the bottom of the menu while only the list above it scrolls.
 * User card on top, a clear Log out button under it.
 */
export function SidebarFooter({ name, sub, dark }: { name?: string | null; sub?: string | null; dark?: boolean }) {
  return (
    <div className={clsx("shrink-0 border-t pt-3", dark ? "border-white/10" : "border-line")}>
      <div className="mb-2 flex items-center justify-between pl-2"><LiveDot /><ThemeToggle deep={dark} /></div>
      <div className={clsx("flex items-center gap-2.5 rounded-[16px] p-2.5", dark ? "bg-night" : "bg-white")}>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-peach-bg text-[12px] font-bold text-peach-fg">{initials(name, 2)}</span>
        <div className="min-w-0 flex-1">
          <p className={clsx("truncate text-[13px] font-semibold leading-4", dark ? "text-white" : "text-ink")}>{name ?? ""}</p>
          <p className={clsx("truncate text-[11px] leading-[13px]", dark ? "text-night-muted" : "text-muted")}>{sub ?? " "}</p>
        </div>
      </div>
      <div className="mt-2"><LogoutButton dark={dark} /></div>
    </div>
  );
}
