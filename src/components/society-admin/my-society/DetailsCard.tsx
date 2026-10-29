"use client";

import { useState } from "react";
import { Button, Field, Input, KeyValue, Panel, PanelTitle } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { societiesApi } from "@/lib/api/societies";
import { lookupPincode } from "@/lib/maps/geocode";
import type { Society } from "@/lib/types/society";
import { titleCase } from "@/lib/utils/format";

/** Society profile: read-only view with an Edit form (primary admin only). */
export function DetailsCard({ society, canEdit }: { society: Society; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({
    name: society.name,
    address: society.address,
    area: society.area,
    city: society.city,
    state: society.state,
    pincode: society.pincode,
    registration_number: society.registration_number ?? "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const pinOk = /^\d{6}$/.test(f.pincode);
  const [areas, setAreas] = useState<string[]>([]);
  // typing a PIN fills the city and state and offers the areas of that PIN
  const onPin = async (raw: string) => {
    const pin = raw.replace(/\D/g, "").slice(0, 6);
    setF((s) => ({ ...s, pincode: pin }));
    if (pin.length !== 6) return setAreas([]);
    const info = await lookupPincode(pin).catch(() => null);
    if (!info) return setAreas([]);
    setAreas(info.areas);
    setF((s) => ({ ...s, city: info.city, state: info.state, area: info.areas.includes(s.area) ? s.area : info.areas[0] ?? s.area }));
  };
  const save = useAction(
    () => societiesApi.update(society.id, { ...f, registration_number: f.registration_number.trim() || null }),
    { invalidate: [["society"]], success: "Society details saved", onSuccess: () => setEditing(false) },
  );

  return (
    <Panel>
      <PanelTitle aside={canEdit && !editing && <button className="font-semibold text-lilac-fg hover:underline" onClick={() => setEditing(true)}>Edit details</button>}>Society details</PanelTitle>
      {editing ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Society name" className="md:col-span-2"><Input value={f.name} onChange={set("name")} /></Field>
            <Field label="Address" className="md:col-span-2"><Input value={f.address} onChange={set("address")} /></Field>
            <Field label="Area"><Input value={f.area} onChange={set("area")} list="my-areas" /><datalist id="my-areas">{areas.map((a) => <option key={a} value={a} />)}</datalist></Field>
            <Field label="City"><Input value={f.city} onChange={set("city")} /></Field>
            <Field label="State"><Input value={f.state} onChange={set("state")} /></Field>
            <Field label="PIN code" hint={f.pincode && !pinOk ? "Enter 6 digits" : undefined}><Input inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => onPin(e.target.value)} /></Field>
            <Field label="Registration number" className="md:col-span-2"><Input value={f.registration_number} onChange={set("registration_number")} placeholder="Optional" /></Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="light" onClick={() => setEditing(false)}>Cancel</Button>
            <Button loading={save.isPending} disabled={!pinOk || f.name.trim().length < 2} onClick={() => save.mutate(undefined)}>Save changes</Button>
          </div>
        </>
      ) : (
        <div className="space-y-2.5">
          <KeyValue label="Name" value={society.name} />
          <KeyValue label="Type" value={titleCase(society.type)} />
          <KeyValue label="Address" value={<span className="font-semibold">{society.address}</span>} />
          <KeyValue label="Area / City" value={`${society.area}, ${society.city}`} />
          <KeyValue label="State · PIN" value={`${society.state} · ${society.pincode}`} />
          <KeyValue label="Registration no." value={society.registration_number ?? "—"} />
          <KeyValue label="Status" value={titleCase(society.status)} />
        </div>
      )}
    </Panel>
  );
}
