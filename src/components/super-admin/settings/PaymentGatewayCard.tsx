"use client";

import { useState } from "react";
import { Badge, Button, Panel } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { settingsApi } from "@/lib/api/ops";
import { PUBLIC_API_URL } from "@/lib/config";
import type { Tone } from "@/lib/utils/tones";
import { SETTING_CARDS } from "./settingsSchema";
import { SettingRow } from "./SettingRow";
import { Check, X } from "lucide-react";

const MASK = "********";
const card = SETTING_CARDS[0]!;

export interface GatewayState {
  tone: Tone;
  badge: string;
  title: string;
  text: string;
}

/** What the Pay buttons will do right now, from the provider and the key prefix (rzp_test_ / rzp_live_). */
export function gatewayState(provider: unknown, keyId: unknown, hasSecret: boolean): GatewayState {
  if (provider !== "razorpay")
    return { tone: "yellow", badge: "Mock · testing", title: "Testing mode", text: "Pay buttons are simulated. No real money moves and nothing reaches Razorpay. Choose Razorpay and add your keys to take real payments." };
  const id = String(keyId ?? "").trim();
  if (!id || !hasSecret)
    return { tone: "pink", badge: "Keys missing", title: "Razorpay keys are missing", text: "Residents will see an error on Pay until you add both the Key ID and the Key secret." };
  if (id.startsWith("rzp_live_"))
    return { tone: "green", badge: "Razorpay · LIVE", title: "Live mode: real money", text: "Every Pay button charges real money to residents' cards and UPI, and refunds move real money back." };
  if (id.startsWith("rzp_test_"))
    return { tone: "blue", badge: "Razorpay · test", title: "Razorpay test mode", text: "Pay opens the real Razorpay checkout, but with test keys no real money moves. Use Razorpay's test card or UPI details." };
  return { tone: "pink", badge: "Check Key ID", title: "This Key ID does not look right", text: "A Razorpay Key ID starts with rzp_test_ (testing) or rzp_live_ (real money)." };
}

export function PaymentGatewayCard({
  saved,
  current,
  onChange,
  dirty,
  loading,
}: {
  saved: Record<string, unknown> | undefined;
  current: (field: string) => unknown;
  onChange: (field: string, v: unknown) => void;
  dirty: boolean;
  loading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const secretNow = current("key_secret");
  const hasSecret = secretNow === MASK || String(secretNow ?? "").trim().length > 0;
  const st = gatewayState(current("provider"), current("key_id"), hasSecret);
  const webhook = `${PUBLIC_API_URL}/payments/webhook/razorpay`;
  const isLocal = /localhost|127\.0\.0\.1/.test(webhook);

  const test = useAction(() => settingsApi.testGateway(), {});
  const result = test.data;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(webhook);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* the URL is visible to copy by hand */
    }
  };

  return (
    <Panel variant="tone" tone={card.tone} className="lg:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold leading-[19px] text-ink">Payment gateway</h2>
        <Badge tone={st.tone} className="!bg-white">{st.badge}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {card.fields.map((f) => (
            <SettingRow key={f.field} def={f} value={current(f.field)} onChange={(v) => onChange(f.field, v)} />
          ))}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" variant="white" loading={test.isPending} disabled={dirty || loading} onClick={() => test.mutate(undefined)}>Test saved keys</Button>
            {dirty && <span className="text-[11px] text-body">Save your changes first, then test.</span>}
          </div>
          {result && (
            <p className={`rounded-[14px] px-3 py-2 text-[12px] font-medium leading-4 ${result.ok ? "bg-white text-green-fg" : "bg-white text-pink-fg"}`}>
              {result.ok ? <Check size={14} strokeWidth={3} className="mr-1 inline" /> : <X size={14} strokeWidth={3} className="mr-1 inline" />}{result.message}
            </p>
          )}
        </div>

        <div className="space-y-2.5 text-[12px] leading-4 text-body">
          <div className="rounded-[14px] bg-white px-3.5 py-3">
            <p className="text-[13px] font-bold text-ink">{st.title}</p>
            <p className="mt-0.5">{st.text}</p>
          </div>
          <div className="rounded-[14px] bg-white px-3.5 py-3">
            <p className="text-[13px] font-bold text-ink">Where to get the keys</p>
            <p className="mt-0.5">Razorpay Dashboard → Account &amp; Settings → API Keys. Switch the dashboard to <strong>Test mode</strong> for rzp_test_ keys, or <strong>Live mode</strong> for rzp_live_ keys.</p>
          </div>
          <div className="rounded-[14px] bg-white px-3.5 py-3">
            <p className="text-[13px] font-bold text-ink">Webhook (recommended)</p>
            <p className="mt-0.5">Razorpay → Settings → Webhooks → add this URL, tick <em>payment.captured, payment.failed, order.paid</em> and refund events, and use the same secret as above.</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-[10px] bg-mist px-2.5 py-1.5 text-[11px] text-ink">{webhook}</code>
              <Button size="sm" variant="light" onClick={copy}>{copied ? <span className="inline-flex items-center gap-1">Copied <Check size={14} strokeWidth={3} /></span> : "Copy"}</Button>
            </div>
            {isLocal && <p className="mt-1.5 text-yellow-fg">This is a localhost address. Razorpay can only reach a public URL (deploy, or use a tunnel like ngrok).</p>}
          </div>
          <p className="px-1 text-[11px] text-muted">Secrets are stored on the server. Click the eye on a secret to see what is saved. Leave a secret field untouched to keep the saved one.</p>
        </div>
      </div>
    </Panel>
  );
}
