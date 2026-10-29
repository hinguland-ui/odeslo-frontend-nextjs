"use client";

import { Toggle } from "@/components/ui";
import type { FeatureKey } from "@/lib/types/society";
import type { OnboardForm } from "./useOnboardForm";

export const FEATURE_LABELS: Record<FeatureKey, { label: string; hint: string }> = {
  group_deals: { label: "Group deals", hint: "Residents book services together" },
  maintenance: { label: "Maintenance", hint: "Bills, reminders, online payment" },
  complaints: { label: "Complaints", hint: "Raise and track issues" },
  requests: { label: "Requests", hint: "NOC, parking and other requests" },
  masjid: { label: "Masjid", hint: "Nearby masjids and jamaat times" },
  staff: { label: "Staff app", hint: "Guards and helpers with their own login" },
  announcements: { label: "Announcements", hint: "Notices to every resident" },
};

export function FeaturesStep({ form }: { form: OnboardForm }) {
  return (
    <div className="space-y-2">
      {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((k) => (
        <div key={k} className="flex items-center justify-between rounded-[14px] bg-panel px-3.5 py-2.5">
          <div>
            <p className="text-[13px] font-semibold leading-4 text-ink">{FEATURE_LABELS[k].label}</p>
            <p className="text-[11px] leading-[13px] text-muted">{FEATURE_LABELS[k].hint}</p>
          </div>
          <Toggle checked={form.features[k]} onChange={(v) => form.setFeatures((f) => ({ ...f, [k]: v }))} label={FEATURE_LABELS[k].label} />
        </div>
      ))}
    </div>
  );
}
