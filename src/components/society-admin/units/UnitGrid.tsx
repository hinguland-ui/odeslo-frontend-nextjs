import clsx from "clsx";
import type { Resident } from "@/lib/types/resident";
import type { Unit } from "@/lib/types/society";

export type UnitState = "owner" | "tenant" | "vacant" | "pending";

const STYLE: Record<UnitState, string> = {
  owner: "bg-lilac-bg border-lilac-line",
  tenant: "bg-blue-bg border-blue-line",
  vacant: "bg-white border-arrow border-dashed",
  pending: "bg-yellow-bg border-yellow-line",
};

export function Legend() {
  const items: [UnitState, string, string][] = [
    ["owner", "Owner", "bg-lilac-bg border-lilac-fg"],
    ["tenant", "Tenant", "bg-blue-bg border-blue-fg"],
    ["vacant", "Vacant", "bg-white border-arrow border-dashed"],
    ["pending", "Pending", "bg-yellow-bg border-yellow-fg"],
  ];
  return (
    <div className="flex items-center gap-4 text-[12px] text-body">
      {items.map(([k, label, cls]) => (
        <span key={k} className="flex items-center gap-1.5"><span className={clsx("size-3.5 rounded-[4px] border", cls)} />{label}</span>
      ))}
    </div>
  );
}

/** Floors top → bottom, unit chips coloured by occupancy. */
export function UnitGrid({ units, wingName, residents, pendingUnits }: { units: Unit[]; wingName: string; residents: Resident[]; pendingUnits: Set<number> }) {
  const floors = new Map<number, Unit[]>();
  units.forEach((u) => floors.set(u.floor ?? 0, [...(floors.get(u.floor ?? 0) ?? []), u]));
  const order = [...floors.keys()].sort((a, b) => b - a);

  const label = (u: Unit): { state: UnitState; text: string } => {
    if (pendingUnits.has(u.id) && u.occupancy_status === "vacant") return { state: "pending", text: "Pending" };
    const people = residents.filter((r) => r.unit_id === u.id && r.is_primary);
    if (u.occupancy_status === "tenant") {
      const t = people.find((r) => r.resident_type === "tenant");
      return { state: "tenant", text: t ? `Tenant · ${t.name.split(" ")[0]}` : "Tenant" };
    }
    if (u.occupancy_status === "owner") {
      const o = people.find((r) => r.resident_type === "owner") ?? people[0];
      return { state: "owner", text: o ? o.name.split(" ").slice(-1)[0]! : "Owner" };
    }
    return { state: "vacant", text: "Vacant" };
  };

  return (
    <div className="space-y-2">
      {order.map((f) => (
        <div key={f} className="flex items-start gap-3">
          <span className="w-[62px] shrink-0 pt-[10px] text-[11px] font-semibold leading-[13px] text-muted">{f ? `Floor ${f}` : "Ground"}</span>
          <div className="grid flex-1 grid-cols-2 gap-2 lg:grid-cols-4">
            {floors.get(f)!.sort((a, b) => a.unit_no.localeCompare(b.unit_no, undefined, { numeric: true })).map((u) => {
              const l = label(u);
              return (
                <div key={u.id} className={clsx("flex h-[34px] items-center justify-between rounded-[12px] border px-3", STYLE[l.state])}>
                  <span className={clsx("text-[13px] font-bold leading-4", l.state === "vacant" ? "text-muted" : "text-ink")}>{wingName}-{u.unit_no}</span>
                  <span className="truncate pl-2 text-[11px] leading-[13px] text-body">{l.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
