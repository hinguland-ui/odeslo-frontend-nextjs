"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { Badge, Button, EmptyState, Field, Input, KeyValue, Note, PageHeader, Panel, PanelTitle } from "@/components/ui";
import { SocietiesPanel } from "@/components/vendor/profile/SocietiesPanel";
import { useAction } from "@/hooks/useAction";
import { useIfsc } from "@/hooks/useIfsc";
import { vendorApi } from "@/lib/api/vendor";
import type { Partner } from "@/lib/types/deal";
import { fullDate } from "@/lib/utils/format";

function ProfileForm({ partner }: { partner: Partner }) {
  const bank = partner.bank_details ?? {};
  const [business, setBusiness] = useState(partner.business_name ?? "");
  const [email, setEmail] = useState(partner.email ?? "");
  const [accountName, setAccountName] = useState(bank.account_name ?? "");
  const [accountNo, setAccountNo] = useState(bank.account_no ?? "");
  const [ifsc, setIfsc] = useState(bank.ifsc ?? "");
  const [upi, setUpi] = useState(bank.upi_id ?? "");

  const bankLookup = useIfsc(ifsc);
  const ifscBad = ifsc !== "" && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const save = useAction(
    () =>
      vendorApi.updateProfile({
        business_name: business.trim() || null,
        email: email.trim() || null,
        bank_details: {
          account_name: accountName.trim() || null,
          account_no: accountNo.trim() || null,
          ifsc: ifsc || null,
          upi_id: upi.trim() || null,
        },
      }),
    { invalidate: [["vendor"], ["me"]], success: "Profile saved" },
  );

  return (
    <Panel>
      <PanelTitle>Business &amp; payout details</PanelTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Business name"><Input value={business} onChange={(e) => setBusiness(e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Account holder name"><Input value={accountName} onChange={(e) => setAccountName(e.target.value)} /></Field>
        <Field label="Account number"><Input inputMode="numeric" value={accountNo} onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="IFSC" hint={ifscBad ? "Format: 4 letters, 0, then 6 letters/digits (e.g. HDFC0001234)" : bankLookup.isFetching ? "Checking bank…" : bankLookup.data ? `✓ ${bankLookup.data.BANK} · ${bankLookup.data.BRANCH}, ${bankLookup.data.CITY}` : bankLookup.data === null ? "No bank found for this IFSC. Please check it." : undefined}>
          <Input value={ifsc} maxLength={11} onChange={(e) => setIfsc(e.target.value.toUpperCase())} />
        </Field>
        <Field label="UPI ID"><Input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@bank" /></Field>
      </div>
      <div className="mt-5 flex justify-end">
        <Button loading={save.isPending} disabled={ifscBad} onClick={() => save.mutate(undefined)}>Save changes</Button>
      </div>
    </Panel>
  );
}

export default function VendorProfilePage() {
  const profile = useQuery({ queryKey: ["vendor", "profile"], queryFn: vendorApi.profile });
  const p = profile.data;

  return (
    <>
      <PageHeader title="Profile," light="your services, societies and bank details." />
      {profile.isLoading && <PageLoader minHeight={360} />}
      {!profile.isLoading && !p && <EmptyState title="Could not load your profile" />}
      {p && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <SocietiesPanel partner={p} />
            <ProfileForm key={p.id + String(p.business_name) + String(p.email)} partner={p} />
          </div>
          <Panel variant="soft" as="aside" className="flex flex-col gap-3">
            <PanelTitle>Account</PanelTitle>
            <KeyValue label="Name" value={p.name} />
            <KeyValue label="Mobile" value={p.mobile} />
            <KeyValue label="GST" value={p.gst ?? "—"} />
            <KeyValue label="Member since" value={fullDate(p.created_at)} />
            <KeyValue label="Societies" value={p.society_ids.length} />
            <KeyValue label="Rating" value={p.rating_count ? `★ ${p.rating_avg.toFixed(1)} (${p.rating_count})` : "No reviews"} />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-body">Verification</span>
              <Badge tone={p.verified ? "green" : "yellow"}>{p.verified ? "Verified" : "Pending"}</Badge>
            </div>
            <Note tone="lilac">Name, mobile, GST, services and societies are managed by the Odeslo team. Contact support to change them.</Note>
          </Panel>
        </div>
      )}
    </>
  );
}
