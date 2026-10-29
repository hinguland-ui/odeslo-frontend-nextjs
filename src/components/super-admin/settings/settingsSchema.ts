import type { Tone } from "@/lib/utils/tones";

export type FieldKind = "text" | "secret" | "number" | "bool" | "select";

export interface SettingField {
  /** setting key (payment_gateway, sms …) */
  key: string;
  /** field inside the setting value */
  field: string;
  label: string;
  kind: FieldKind;
  options?: { value: string; label: string }[];
  /** grey example inside the empty box */
  placeholder?: string;
  hint?: string;
}

export interface SettingCard {
  id: "payment" | "email" | "sms" | "whatsapp" | "app";
  title: string;
  tone: Tone;
  badge: (v: Record<string, Record<string, unknown>>) => { tone: Tone; label: string };
  fields: SettingField[];
}

const opt = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

/** Maps the backend platform settings onto the cards of the settings page. */
export const SETTING_CARDS: SettingCard[] = [
  {
    id: "payment",
    title: "Payment gateway",
    tone: "lilac",
    badge: (v) => (v.payment_gateway?.provider === "razorpay" ? (String(v.payment_gateway?.key_id ?? "").startsWith("rzp_live_") ? { tone: "green", label: "Live mode" } : { tone: "blue", label: "Razorpay test" }) : { tone: "yellow", label: "Mock · testing" }),
    fields: [
      { key: "payment_gateway", field: "provider", label: "Provider", kind: "select", options: opt([["mock", "Mock (testing, no real money)"], ["razorpay", "Razorpay (test or live keys)"]]) },
      { key: "payment_gateway", field: "key_id", label: "Key ID", kind: "text", placeholder: "rzp_test_xxxxxxxxxxxxxx" },
      { key: "payment_gateway", field: "key_secret", label: "Key secret", kind: "secret", placeholder: "Razorpay key secret" },
      { key: "payment_gateway", field: "webhook_secret", label: "Webhook secret", kind: "secret", placeholder: "Same secret as in the Razorpay webhook" },
    ],
  },
  {
    id: "email",
    title: "Email (SMTP)",
    tone: "green",
    badge: (v) => (v.email?.smtp_host ? { tone: "green", label: "Configured" } : { tone: "yellow", label: "Log only" }),
    fields: [
      { key: "email", field: "smtp_host", label: "SMTP host", kind: "text", placeholder: "smtp.gmail.com" },
      { key: "email", field: "smtp_port", label: "SMTP port", kind: "number", placeholder: "587", hint: "587 for STARTTLS, 465 for SSL" },
      { key: "email", field: "security", label: "Security", kind: "select", options: opt([["starttls", "STARTTLS (port 587)"], ["ssl", "SSL / TLS (port 465)"], ["none", "None (not recommended)"]]) },
      { key: "email", field: "smtp_user", label: "SMTP username", kind: "text", placeholder: "you@yourdomain.com" },
      { key: "email", field: "smtp_password", label: "SMTP password", kind: "secret", placeholder: "Password or app password" },
      { key: "email", field: "from_name", label: "From name", kind: "text", placeholder: "Odeslo" },
      { key: "email", field: "from", label: "From email", kind: "text", placeholder: "no-reply@yourdomain.com" },
      { key: "email", field: "admin_email", label: "Admin email", kind: "text", placeholder: "admin@yourdomain.com", hint: "Where platform alerts are sent" },
    ],
  },
  {
    id: "sms",
    title: "SMS",
    tone: "blue",
    badge: (v) => (v.sms?.provider === "http" ? { tone: "green", label: "Connected" } : { tone: "yellow", label: "Console only" }),
    fields: [
      { key: "sms", field: "provider", label: "SMS provider", kind: "select", options: opt([["console", "Console (development, only logs)"], ["http", "HTTP API (real SMS)"]]) },
      { key: "sms", field: "sender_id", label: "Sender ID", kind: "text", placeholder: "ODESLO" },
      { key: "sms", field: "api_url", label: "SMS API URL", kind: "text", placeholder: "https://api.your-sms-provider.com/send" },
      { key: "sms", field: "api_key", label: "SMS API key", kind: "secret", placeholder: "Your SMS provider key" },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    tone: "peach",
    badge: (v) => (v.whatsapp?.provider === "http" ? { tone: "green", label: "Connected" } : { tone: "yellow", label: "Console only" }),
    fields: [
      { key: "whatsapp", field: "provider", label: "WhatsApp", kind: "select", options: opt([["console", "Console (development, only logs)"], ["http", "Business API"]]) },
      { key: "whatsapp", field: "api_url", label: "API URL", kind: "text", placeholder: "https://graph.facebook.com/v20.0/.../messages" },
      { key: "whatsapp", field: "api_key", label: "WhatsApp API key", kind: "secret", placeholder: "Business API token" },
    ],
  },
  {
    id: "app",
    title: "Push & app",
    tone: "yellow",
    badge: (v) => ({ tone: "blue", label: `v${String(v.app_version?.latest_version ?? "")}` }),
    fields: [
      { key: "app_version", field: "latest_version", label: "Latest app version", kind: "text", placeholder: "1.0.0" },
      { key: "app_version", field: "min_supported_version", label: "Minimum app version", kind: "text", placeholder: "1.0.0", hint: "Older apps are asked to update" },
      { key: "app_version", field: "force_update", label: "Force update", kind: "bool" },
    ],
  },
];
