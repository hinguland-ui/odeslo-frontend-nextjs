"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge, Button, ErrorState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { PaymentGatewayCard } from "@/components/super-admin/settings/PaymentGatewayCard";
import { UploadLimitsCard } from "@/components/super-admin/settings/UploadLimitsCard";
import { SettingRow } from "@/components/super-admin/settings/SettingRow";
import { SETTING_CARDS } from "@/components/super-admin/settings/settingsSchema";
import { TestSend } from "@/components/super-admin/settings/TestSend";
import { useAction } from "@/hooks/useAction";
import { settingsApi } from "@/lib/api/ops";

type Values = Record<string, Record<string, unknown>>;

export default function PlatformSettingsPage() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: settingsApi.list });
  // Only edited fields are sent; the backend merges them, so masked secrets stay untouched.
  const [edits, setEdits] = useState<Values>({});

  const saved = useMemo<Values>(() => Object.fromEntries(settings.data?.map((s) => [s.key, s.value]) ?? []), [settings.data]);
  const current = (key: string, field: string) => (edits[key] && field in edits[key] ? edits[key][field] : saved[key]?.[field]);
  const setField = (key: string, field: string, v: unknown) => setEdits((e) => ({ ...e, [key]: { ...e[key], [field]: v } }));
  const dirty = Object.keys(edits).length > 0;

  const save = useAction(() => Promise.all(Object.entries(edits).map(([k, v]) => settingsApi.update(k, v))), {
    success: "Settings saved",
    invalidate: [["settings"]],
    onSuccess: () => setEdits({}),
  });

  const merged: Values = Object.fromEntries(Object.keys(saved).map((k) => [k, { ...saved[k], ...edits[k] }]));

  return (
    <>
      <PageHeader
        title="Platform settings,"
        light="keys & defaults."
        actions={
          <>
            {dirty && <Button variant="light" onClick={() => setEdits({})}>Discard</Button>}
            <Button onClick={() => save.mutate(undefined)} loading={save.isPending} disabled={!dirty}>Save changes</Button>
          </>
        }
      />
      {settings.error && <ErrorState error={settings.error} onRetry={() => settings.refetch()} />}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PaymentGatewayCard
          saved={saved.payment_gateway}
          current={(f) => current("payment_gateway", f)}
          onChange={(f, v) => setField("payment_gateway", f, v)}
          dirty={dirty}
          loading={settings.isLoading}
        />
        <UploadLimitsCard current={(f) => current("uploads", f)} onChange={(f, v) => setField("uploads", f, v)} />
        {SETTING_CARDS.filter((c) => c.id !== "payment").map((card) => {
          const badge = card.badge(merged);
          const wide = card.id === "email"; // SMTP has the most fields: full width, two columns
          return (
            <Panel key={card.id} variant="tone" tone={card.tone} className={wide ? "lg:col-span-2" : undefined}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-bold leading-[19px] text-ink">{card.title}</h2>
                <Badge tone={badge.tone} className="!bg-white">{badge.label}</Badge>
              </div>
              <div className={wide ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "space-y-3"}>
                {settings.isLoading
                  ? Array.from({ length: wide ? 6 : 3 }).map((_, i) => <Skeleton key={i} className="h-[62px] !bg-white/70" />)
                  : card.fields.map((f) => (
                      <SettingRow key={`${f.key}.${f.field}`} def={f} value={current(f.key, f.field)} onChange={(v) => setField(f.key, f.field, v)} />
                    ))}
              </div>
              {card.id === "email" && <TestSend kind="email" dirty={dirty} loading={settings.isLoading} />}
              {card.id === "sms" && <TestSend kind="sms" dirty={dirty} loading={settings.isLoading} />}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
