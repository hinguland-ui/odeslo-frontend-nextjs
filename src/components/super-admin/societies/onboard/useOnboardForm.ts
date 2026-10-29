"use client";

import { useState } from "react";
import type { Features, SocietyCreate } from "@/lib/types/society";

export interface WingDraft {
  name: string;
  floors: number;
  perFloor: number;
  unitType: string;
}

export const DEFAULT_FEATURES: Features = {
  group_deals: true,
  masjid: true,
  complaints: true,
  requests: true,
  maintenance: true,
  staff: true,
  announcements: true,
};

/** Unit numbers per wing: floor 1 → 101, 102 … */
export function unitsFor(w: WingDraft) {
  const units: { unit_no: string; unit_type: string; floor: number }[] = [];
  for (let f = 1; f <= w.floors; f++) {
    for (let u = 1; u <= w.perFloor; u++) units.push({ unit_no: `${f}${String(u).padStart(2, "0")}`, unit_type: w.unitType, floor: f });
  }
  return units;
}

export function useOnboardForm() {
  const [details, setDetails] = useState({
    name: "", type: "apartment", address: "", area: "", city: "", state: "", pincode: "",
    lat: "", lng: "", registration_number: "", require_documents: false,
  });
  const [wings, setWings] = useState<WingDraft[]>([{ name: "A", floors: 4, perFloor: 4, unitType: "flat" }]);
  const [billing, setBilling] = useState({ flat: 2000, duplex: 3000, shop: 1500, due_day: 10, late_fee: 100, late_fee_enabled: true, billing_cycle: "monthly" as "monthly" | "quarterly" });
  const [admin, setAdmin] = useState({ name: "", designation: "secretary", mobile: "", email: "" });
  const [features, setFeatures] = useState<Features>(DEFAULT_FEATURES);

  const totalUnits = wings.reduce((s, w) => s + w.floors * w.perFloor, 0);

  const valid = {
    details: !!(details.name && details.address && details.area && details.city && details.state && /^\d{6}$/.test(details.pincode) && details.lat && details.lng),
    wings: wings.length > 0 && wings.every((w) => w.name && w.floors > 0 && w.perFloor > 0),
    billing: !!(admin.name && /^\d{10}$/.test(admin.mobile) && /\S+@\S+\.\S+/.test(admin.email) && billing.due_day >= 1 && billing.due_day <= 28),
  };

  const payload = (): SocietyCreate => ({
    name: details.name.trim(),
    type: details.type,
    address: details.address.trim(),
    area: details.area.trim(),
    city: details.city.trim(),
    state: details.state.trim(),
    pincode: details.pincode,
    lat: Number(details.lat),
    lng: Number(details.lng),
    registration_number: details.registration_number || null,
    require_documents: details.require_documents,
    wings: wings.map((w) => ({ name: w.name.trim(), units: unitsFor(w) })),
    primary_admin: { name: admin.name.trim(), mobile: admin.mobile, email: admin.email.trim(), designation: admin.designation },
    maintenance_settings: {
      amounts: { flat: billing.flat, duplex: billing.duplex, shop: billing.shop },
      billing_cycle: billing.billing_cycle,
      due_day: billing.due_day,
      late_fee_enabled: billing.late_fee_enabled,
      late_fee: billing.late_fee,
    },
    features,
  });

  return { details, setDetails, wings, setWings, billing, setBilling, admin, setAdmin, features, setFeatures, totalUnits, valid, payload };
}

export type OnboardForm = ReturnType<typeof useOnboardForm>;
