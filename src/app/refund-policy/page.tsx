import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, LegalShell, List, Section } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: { absolute: "Refund & Cancellation Policy · Odeslo" },
  description: "How cancellations and refunds work for bookings and payments made through Odeslo.",
};

export default function RefundPolicyPage() {
  return (
    <LegalShell
      title="Refund & Cancellation Policy"
      updated="13 November 2026"
      intro={<p>This policy explains how cancellations and refunds work for service bookings and payments made through Odeslo. Services are provided by independent vendors; see our <Link href="/terms-and-conditions" className="text-violet underline">Terms &amp; Conditions</Link> for details.</p>}
    >
      <Section title="1. Cancelling a booking">
        <List items={[
          "You can cancel a booking from the app before the vendor starts the job.",
          "Cancelling early is free. If the vendor has already travelled to you or started work, a reasonable charge for the time and effort may apply.",
          "Vendors may also cancel a job. If they do, you will not be charged for it.",
        ]} />
      </Section>

      <Section title="2. When you can get a refund">
        <List items={[
          "You were charged but the booking was not confirmed or the service was not delivered.",
          "You were charged more than once for the same booking (duplicate payment).",
          "The service was not completed as agreed, and you raised the issue with us.",
          "You cancelled before the vendor started and had already paid online.",
        ]} />
      </Section>

      <Section title="3. When a refund may not be given">
        <List items={[
          "The service was completed as agreed.",
          "You were not available or did not give access, and the vendor had already arrived.",
          "The request is made long after the service was done and cannot be verified.",
          "Society maintenance or other dues already collected and passed on to your society. These are handled by your society admin.",
        ]} />
      </Section>

      <Section title="4. How to request a refund">
        <p>Raise a complaint in the app, or write to <a className="text-violet underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or WhatsApp us at <a className="text-violet underline" href={CONTACT.whatsapp}>{CONTACT.phone}</a>. Please include the booking details, payment reference and a short description of the problem. We may ask for photos or more information.</p>
      </Section>

      <Section title="5. Refund timeline">
        <p>We review requests within 5 working days. Approved refunds go back to the original payment method through Razorpay, usually within 5 to 7 working days after approval, depending on your bank or payment provider.</p>
      </Section>

      <Section title="6. Questions">
        <p>If you disagree with a decision, write to us and we will look at it again. See also our <Link href="/privacy-policy" className="text-violet underline">Privacy Policy</Link>.</p>
      </Section>
    </LegalShell>
  );
}
