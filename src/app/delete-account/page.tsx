import type { Metadata } from "next";
import { CONTACT, LegalShell, List, Section } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: { absolute: "Delete your account · Odeslo" },
  description: "How to request deletion of your Odeslo account and the data linked to it.",
};

export default function DeleteAccountPage() {
  return (
    <LegalShell
      title="Delete your Odeslo account"
      updated="29 October 2026"
      intro={<p>You can ask us to delete your Odeslo account (app <b>Odeslo</b>, by Odeslo) and the personal data linked to it at any time. Contact us using any of the options below.</p>}
    >
      <Section title="How to request deletion">
        <div className="grid gap-3 sm:grid-cols-3">
          <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Account deletion request")}`} className="rounded-2xl border border-line bg-white p-4 hover:border-violet">
            <p className="text-sm text-muted">Email</p>
            <p className="mt-1 font-semibold text-ink">{CONTACT.email}</p>
          </a>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-line bg-white p-4 hover:border-violet">
            <p className="text-sm text-muted">WhatsApp</p>
            <p className="mt-1 font-semibold text-ink">{CONTACT.phone}</p>
          </a>
          <a href={`tel:${CONTACT.tel}`} className="rounded-2xl border border-line bg-white p-4 hover:border-violet">
            <p className="text-sm text-muted">Call</p>
            <p className="mt-1 font-semibold text-ink">{CONTACT.phone}</p>
          </a>
        </div>
        <p>Please include:</p>
        <List items={[
          "Your full name",
          "The mobile number registered with Odeslo",
          "Your role: resident, vendor (service partner) or society admin",
          "Your society name (if you are a resident or society admin)",
        ]} />
        <p>To protect your account, we will confirm the request with you on your registered mobile number before deleting anything.</p>
      </Section>

      <Section title="What happens next">
        <List items={[
          "We confirm your request within 3 working days.",
          "Your account and data are deleted within 30 days of confirmation.",
          "Once deleted, you can no longer sign in and the data cannot be recovered.",
        ]} />
      </Section>

      <Section title="Data we delete">
        <List items={[
          "Your profile: name, mobile number, email and photo",
          "Home details, family members and vehicles you added",
          "Photos and documents you uploaded",
          "Chats, complaints and requests you created",
          "Location data and notification (device) tokens",
        ]} />
      </Section>

      <Section title="Data we may keep">
        <p>Some records are kept for a limited time where the law or the society requires it:</p>
        <List items={[
          "Payment, invoice and refund records: kept as required by Indian tax and accounting law (up to 8 years).",
          "Records of jobs completed for a society: kept so the society and vendor have a history of the work, with your personal details removed.",
          "Security logs: kept for up to 180 days, then deleted.",
        ]} />
      </Section>
    </LegalShell>
  );
}
