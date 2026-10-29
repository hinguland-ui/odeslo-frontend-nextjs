"use client";

import { AddressPicker, Field, Input, Select, type AddressValue } from "@/components/ui";
import type { OnboardForm } from "./useOnboardForm";

export function DetailsStep({ form }: { form: OnboardForm }) {
  const { details: d, setDetails } = form;
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDetails((x) => ({ ...x, [k]: e.target.value }));

  // latitude / longitude are never typed: they come from the pin on the map
  const address: AddressValue = {
    address: d.address, area: d.area, city: d.city, state: d.state, pincode: d.pincode,
    lat: d.lat ? Number(d.lat) : null, lng: d.lng ? Number(d.lng) : null,
  };
  const patch = (p: Partial<AddressValue>) =>
    setDetails((x) => ({
      ...x,
      ...(p.address !== undefined && { address: p.address }),
      ...(p.area !== undefined && { area: p.area }),
      ...(p.city !== undefined && { city: p.city }),
      ...(p.state !== undefined && { state: p.state }),
      ...(p.pincode !== undefined && { pincode: p.pincode }),
      ...(p.lat !== undefined && { lat: p.lat == null ? "" : String(p.lat) }),
      ...(p.lng !== undefined && { lng: p.lng == null ? "" : String(p.lng) }),
    }));

  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
      <Field label="Society name"><Input value={d.name} onChange={set("name")} placeholder="Orchid Enclave" /></Field>
      <Field label="Type">
        <Select value={d.type} onChange={set("type")}>
          <option value="apartment">Apartment</option>
          <option value="row_house">Row house</option>
          <option value="duplex">Duplex</option>
          <option value="mixed">Mixed</option>
        </Select>
      </Field>
      <AddressPicker value={address} onChange={patch} />
      <Field label="Registration no. (optional)"><Input value={d.registration_number} onChange={set("registration_number")} /></Field>
      <Field label="Ownership proof">
        <Select value={d.require_documents ? "yes" : "no"} onChange={(e) => setDetails((x) => ({ ...x, require_documents: e.target.value === "yes" }))}>
          <option value="no">Optional for residents</option>
          <option value="yes">Required to join</option>
        </Select>
      </Field>
    </div>
  );
}
