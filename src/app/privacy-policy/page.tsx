import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, LegalShell, List, Section } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy · Odeslo" },
  description: "How Odeslo collects, uses and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="29 October 2026"
      intro={<p>This policy explains what personal data the Odeslo app and website (odeslo.com) collect, why, and the choices you have. Odeslo is a society management platform for residents, vendors (service partners) and society admins. By using Odeslo you agree to this policy.</p>}
    >
      <Section title="1. Data we collect">
        <List items={[
          <><b>Account details:</b> name, mobile number, email address, profile photo and your role (resident, vendor or society admin).</>,
          <><b>Home details:</b> society, tower/flat, owner or tenant status, family members and vehicles you add.</>,
          <><b>Vendor details:</b> business name, services offered and bank details (account number, IFSC) used for payouts.</>,
          <><b>Photos and documents:</b> files you upload, such as complaint photos or verification documents. You can take a photo with the camera or pick one from your gallery.</>,
          <><b>Location:</b> precise location, only while you use a feature that needs it, such as a vendor sharing live location on the way to a job, setting a society address on the map, or finding nearby places of worship and prayer times.</>,
          <><b>Activity:</b> bookings, payments, complaints, requests, chats and notifications inside the app.</>,
          <><b>Technical data:</b> IP address, device notification token and basic logs needed to keep the service secure.</>,
        ]} />
        <p>We do not collect card or UPI details. Online payments are handled by Razorpay; we only keep the payment record (amount, status, reference).</p>
      </Section>

      <Section title="2. How we use your data">
        <List items={[
          "To sign you in with a one-time password (OTP) sent to your mobile number",
          "To run the service: approvals, bookings, jobs, chats, complaints, notices and payments",
          "To show live job tracking and location-based features",
          "To send notifications, SMS, WhatsApp or email about your account and activity",
          "To keep the platform secure and prevent fraud or misuse",
          "To meet legal, tax and accounting requirements",
        ]} />
        <p>We do not sell your personal data and do not use it for advertising.</p>
      </Section>

      <Section title="3. Who can see your data">
        <List items={[
          <><b>Your society admin</b> can see the details of residents and homes in their society.</>,
          <><b>Vendors</b> assigned to your job see what they need to do it: your name, flat and the job chat. Your phone number is not shared through chat.</>,
          <><b>Service providers</b> that help us run Odeslo: Razorpay (payments), SMS / WhatsApp / email providers (OTP and messages), Firebase Cloud Messaging (push notifications), map providers such as OpenStreetMap, OpenFreeMap and CARTO, and our hosting provider. They only get the data needed for their task.</>,
          <><b>Authorities</b>, when required by law.</>,
        ]} />
      </Section>

      <Section title="4. Storage and security">
        <p>Your data is stored on secure servers. All traffic is encrypted with HTTPS, uploaded files are encrypted at rest, and passwords are stored only as secure hashes. Access to data is limited by role. No system is completely secure, but we work to protect your information.</p>
      </Section>

      <Section title="5. How long we keep data">
        <p>We keep your data while your account is active. When you delete your account, we delete your personal data within 30 days, except records we must keep by law, such as payment and invoice records (up to 8 years). See <Link href="/delete-account" className="text-violet underline">Delete your account</Link> for details.</p>
      </Section>

      <Section title="6. Your rights">
        <List items={[
          "Access the personal data we hold about you",
          "Correct or update your details (most can be changed in the app)",
          "Withdraw consent, for example by turning off location or camera permission in your phone settings",
          <>Ask us to delete your account and data (see <Link href="/delete-account" className="text-violet underline">Delete your account</Link>)</>,
          "Raise a complaint with our Grievance Officer",
        ]} />
        <p>To use any of these rights, write to <a className="text-violet underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. We respond within 30 days, as required under India&apos;s Digital Personal Data Protection Act, 2023.</p>
      </Section>

      <Section title="7. Children">
        <p>Odeslo is meant for people 18 years or older. Family members under 18 may be added by an adult resident, who is responsible for that information. We do not knowingly collect data directly from children.</p>
      </Section>

      <Section title="8. Changes to this policy">
        <p>We may update this policy. When we do, we will change the date at the top of this page and, for important changes, let you know in the app.</p>
      </Section>
    </LegalShell>
  );
}
