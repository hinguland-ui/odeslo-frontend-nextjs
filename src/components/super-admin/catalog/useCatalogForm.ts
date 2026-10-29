"use client";

import { useState } from "react";
import type { DealCreate } from "@/lib/types/deal";
import { isoDate } from "@/lib/utils/format";

const inDays = (n: number) => isoDate(new Date(Date.now() + n * 86_400_000));

export function useCatalogForm() {
  const [f, setF] = useState({
    title: "",
    category: "ac",
    subcategory: "",
    partner_id: "",
    society_id: "", // "" = all societies (platform deal)
    description: "",
    service_date: inDays(10),
    cutoff_date: inDays(7),
    slots: "10:00 - 13:00, 14:00 - 17:00",
    price_per_unit: 0,
    partner_payout_per_unit: 0,
    max_units: 30,
    cancel_policy: "Free cancellation before the booking cut-off.",
    pay_later_allowed: false,
    auto_promote_waitlist: true,
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const commission = f.price_per_unit - f.partner_payout_per_unit;

  const valid =
    f.title.trim().length >= 3 && f.price_per_unit > 0 && f.max_units > 0 && f.cutoff_date <= f.service_date &&
    (!f.partner_payout_per_unit || commission >= 0);

  const payload = (): DealCreate => ({
    society_id: f.society_id ? Number(f.society_id) : null,
    title: f.title.trim(),
    category: f.category,
    subcategory: f.subcategory || null,
    description: f.description.trim() || null,
    service_date: f.service_date,
    slots: f.slots.split(",").map((s) => s.trim()).filter(Boolean),
    price_per_unit: f.price_per_unit,
    max_units: f.max_units,
    cutoff_date: `${f.cutoff_date}T20:00:00`,
    cancel_policy: f.cancel_policy || null,
    pay_later_allowed: f.pay_later_allowed,
    auto_promote_waitlist: f.auto_promote_waitlist,
    partner_id: f.partner_id ? Number(f.partner_id) : null,
    partner_payout_per_unit: f.partner_payout_per_unit || null,
  });

  return { f, set, commission, valid, payload };
}

export type CatalogForm = ReturnType<typeof useCatalogForm>;
