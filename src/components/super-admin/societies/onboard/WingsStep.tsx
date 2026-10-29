"use client";

import { Button, Input, Select } from "@/components/ui";
import type { OnboardForm, WingDraft } from "./useOnboardForm";
import { X } from "lucide-react";

/** Wings with floors × units per floor; unit numbers are generated as 101, 102 … */
export function WingsStep({ form }: { form: OnboardForm }) {
  const { wings, setWings } = form;
  const update = (i: number, patch: Partial<WingDraft>) => setWings((ws) => ws.map((w, j) => (j === i ? { ...w, ...patch } : w)));
  const nextName = String.fromCharCode(65 + wings.length);

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr_32px] gap-2 px-1 text-[11px] font-semibold text-muted">
        <span>Wing</span><span>Floors</span><span>Units / floor</span><span>Unit type</span><span />
      </div>
      {wings.map((w, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1.2fr_32px] items-center gap-2">
          <Input value={w.name} onChange={(e) => update(i, { name: e.target.value })} />
          <Input type="number" min={1} value={w.floors} onChange={(e) => update(i, { floors: Number(e.target.value) })} />
          <Input type="number" min={1} value={w.perFloor} onChange={(e) => update(i, { perFloor: Number(e.target.value) })} />
          <Select value={w.unitType} onChange={(e) => update(i, { unitType: e.target.value })}>
            <option value="flat">Flat</option>
            <option value="duplex">Duplex</option>
            <option value="shop">Shop</option>
            <option value="row_house">Row house</option>
          </Select>
          <button
            type="button"
            disabled={wings.length === 1}
            onClick={() => setWings((ws) => ws.filter((_, j) => j !== i))}
            className="grid size-8 place-items-center rounded-full bg-pink-bg text-[12px] text-pink-fg disabled:opacity-40"
            aria-label="Remove wing"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <Button size="sm" variant="light" onClick={() => setWings((ws) => [...ws, { name: nextName, floors: 4, perFloor: 4, unitType: "flat" }])}>
        + Add wing {nextName}
      </Button>
      <p className="text-[12px] leading-[15px] text-muted">
        {form.totalUnits} units will be created. You can rename or add units later from the society admin panel.
      </p>
    </div>
  );
}
