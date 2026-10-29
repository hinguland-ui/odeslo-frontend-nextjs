import { Badge, Panel } from "@/components/ui";
import { toneAt, TONE } from "@/lib/utils/tones";
import type { OnboardForm } from "./useOnboardForm";

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[53px] rounded-[14px] bg-panel px-3 py-2.5">
      <p className="text-[12px] leading-[15px] text-muted">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold leading-4 text-ink">{value || "—"}</p>
    </div>
  );
}

/** Left column: what has been filled so far. */
export function OnboardSummary({ form }: { form: OnboardForm }) {
  const d = form.details;
  return (
    <Panel className="min-h-[707px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold leading-[19px] text-ink">Society details</h2>
        <Badge tone={form.valid.details ? "green" : "yellow"} dot={false}>{form.valid.details ? "Done" : "In progress"}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Tile label="Name" value={d.name} />
        <Tile label="Society code" value="Auto-generated" />
        <Tile label="Address" value={[d.area, d.city, d.pincode].filter(Boolean).join(", ")} />
        <Tile label="Location" value={d.lat && d.lng ? `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)} ✓` : ""} />
      </div>

      <div className="mb-3 mt-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold leading-[19px] text-ink">Wings &amp; units</h2>
        <Badge tone="green" dot={false}>{form.totalUnits} units</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {form.wings.map((w, i) => (
          <div key={i} className={`min-h-[60px] rounded-[16px] px-3 py-3 ${TONE[toneAt(i)].bg}`}>
            <p className="text-[18px] font-bold leading-[23px] text-ink">Wing {w.name}</p>
            <p className="text-[11px] leading-[13px] text-body">{w.floors} floors · {w.floors * w.perFloor} {w.unitType}s</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-[16px] border border-dashed border-dash px-3.5 py-3 text-[12px] leading-[15px] text-body">
        Units are numbered by floor (101, 102 …). Bulk upload or edits are available after onboarding.
      </div>
    </Panel>
  );
}
