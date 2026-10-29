"use client";

import { useQuery } from "@tanstack/react-query";
import { Button, KeyValue, Panel } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { maintenanceApi } from "@/lib/api/money";
import type { MaintenanceSettings } from "@/lib/types/society";
import { inr, titleCase } from "@/lib/utils/format";

/** Billing settings, offline payment hint and defaulters download. */
export function MaintenanceAside({ settings, onOffline }: { settings?: MaintenanceSettings; onOffline: () => void }) {
  const toast = useToast();
  const defaulters = useQuery({ queryKey: ["maintenance", "defaulters"], queryFn: maintenanceApi.defaulters });
  const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 10 > 3 || Math.floor(n / 10) === 1 ? 0 : n % 10]}`;

  const download = () => {
    const rows = defaulters.data ?? [];
    if (!rows.length) return toast("No defaulters right now", "info");
    const csv = ["Unit,Resident,Mobile,Unpaid bills,Outstanding,Oldest due", ...rows.map((d) =>
      [d.unit_label, d.resident_name ?? "", d.resident_mobile ?? "", d.unpaid_bills, d.outstanding, d.oldest_due_date].map((v) => `"${v}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "defaulters.csv";
    a.click();
  };

  return (
    <div className="space-y-3">
      <Panel variant="soft" className="!rounded-[22px] !p-4">
        <p className="text-[13px] font-bold leading-4 text-ink">Billing settings</p>
        <div className="mt-2.5 space-y-2">
          {Object.entries(settings?.amounts ?? {}).map(([k, v]) => (
            <KeyValue key={k} label={<span className="text-muted">{titleCase(k)}</span>} value={inr(v)} valueClass="font-semibold" />
          ))}
          <KeyValue label={<span className="text-muted">Cycle · due day</span>} value={settings ? `${titleCase(settings.billing_cycle)} · ${ordinal(settings.due_day)}` : "—"} valueClass="font-semibold" />
          <KeyValue label={<span className="text-muted">Late fee</span>} value={settings?.late_fee_enabled ? `${inr(settings.late_fee)} flat` : "Off"} valueClass="font-semibold" />
        </div>
      </Panel>
      <button onClick={onOffline} className="block w-full rounded-[22px] bg-lilac-bg p-4 text-left transition hover:brightness-[0.98]">
        <p className="text-[13px] font-bold leading-4 text-lilac-fg">Offline payment</p>
        <p className="mt-1.5 text-[12px] leading-[15px] text-body">Record cash, cheque or UPI paid to the office. A receipt is sent to the resident automatically.</p>
      </button>
      <Button variant="light" block onClick={download}>Download defaulters list · {defaulters.data?.length ?? 0}</Button>
    </div>
  );
}
