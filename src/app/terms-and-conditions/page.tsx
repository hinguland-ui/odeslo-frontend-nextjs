import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, LegalShell, List, Section } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: { absolute: "Terms & Conditions · Odeslo" },
  description: "The terms that apply when you use the Odeslo app and website.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions"
      updated="13 November 2026"
      intro={<p>These terms apply to your use of the Odeslo app and website (odeslo.com). Odeslo is a society management platform for residents, vendors (service partners) and society admins. By creating an account or using Odeslo, you agree to these terms. If you do not agree, please do not use the service.</p>}
    >
      <Section title="1. Eligibility and accounts">
        <List items={[
          "You must be 18 years or older to create an account.",
          "You sign in with a one-time password (OTP) sent to your mobile number. Keep your phone and OTPs safe; you are responsible for activity on your account.",
          "Give correct and current details. Residents may need approval from their society admin, and vendors may need verification, before using some features.",
          "Do not create multiple accounts to misuse offers or bypass a block.",
        ]} />
      </Section>

      <Section title="2. What Odeslo does">
        <p>Odeslo helps societies run day-to-day operations: notices, complaints, maintenance, home management, service bookings, and communication between residents, vendors and admins. Odeslo is a platform. Services are carried out by independent vendors, not by Odeslo, unless we clearly say otherwise.</p>
      </Section>

      <Section title="3. Your responsibilities">
        <List items={[
          "Use Odeslo only for lawful purposes and in line with your society’s rules.",
          "Do not post false, abusive, hateful, obscene or misleading content, or share another person’s private data without permission.",
          "Do not try to hack, disrupt, scrape or reverse-engineer the app, or access data you are not allowed to see.",
          "Do not upload malware or content that infringes anyone’s rights.",
          "Society admins are responsible for the accuracy of the notices, approvals and records they publish for their society.",
        ]} />
      </Section>

      <Section title="4. Vendors (service partners)">
        <List items={[
          "Vendors are independent businesses or individuals, not employees or agents of Odeslo.",
          "Vendors must provide accurate business, service and bank details, perform jobs with reasonable skill and care, and behave respectfully with residents.",
          "Vendors may share live location only while on a job, to help the resident track it.",
          "We may pause or remove a vendor for poor service, fraud, repeated complaints or breaking these terms.",
        ]} />
      </Section>

      <Section title="5. Bookings and payments">
        <p>Prices and charges are shown in the app before you confirm. Online payments are processed by Razorpay; we do not store your card or UPI details. Please read our <Link href="/refund-policy" className="text-violet underline">Refund &amp; Cancellation Policy</Link> for cancellations and refunds.</p>
      </Section>

      <Section title="6. Content you add">
        <p>You keep ownership of the photos, text and documents you upload. You allow Odeslo to store, display and process them as needed to run the service for you and your society. You confirm you have the right to share them.</p>
      </Section>

      <Section title="7. Privacy">
        <p>How we collect and use your data is explained in our <Link href="/privacy-policy" className="text-violet underline">Privacy Policy</Link>. You can ask for your account to be deleted at any time through <Link href="/delete-account" className="text-violet underline">Delete your account</Link>.</p>
      </Section>

      <Section title="8. Suspension and termination">
        <p>We may suspend or close an account, with or without notice, if you break these terms, misuse the platform, or if required by law. You may stop using Odeslo or delete your account at any time.</p>
      </Section>

      <Section title="9. Disclaimer and limits of liability">
        <List items={[
          "Odeslo is provided “as is”. We work to keep it available and accurate, but cannot promise it will be error-free or always uninterrupted.",
          "We are not responsible for the quality, safety or timing of services delivered by vendors, or for disputes between residents, vendors and society admins, though we will try to help resolve them.",
          "To the extent allowed by law, Odeslo is not liable for indirect or consequential losses. Our total liability for any claim is limited to the amount you paid through Odeslo for the related booking.",
        ]} />
      </Section>

      <Section title="10. Changes to these terms">
        <p>We may update these terms from time to time. When we do, we will change the date at the top of this page and, for important changes, let you know in the app. Continuing to use Odeslo after a change means you accept the new terms.</p>
      </Section>

      <Section title="11. Governing law and grievances">
        <p>These terms are governed by the laws of India, and the courts in India have jurisdiction. For complaints or questions, write to <a className="text-violet underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. We aim to respond within 30 days.</p>
      </Section>
    </LegalShell>
  );
}
