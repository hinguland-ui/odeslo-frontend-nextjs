"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Button, PageHeader, Panel } from "@/components/ui";
import { BillingAdminStep } from "@/components/super-admin/societies/onboard/BillingAdminStep";
import { DetailsStep } from "@/components/super-admin/societies/onboard/DetailsStep";
import { FeaturesStep } from "@/components/super-admin/societies/onboard/FeaturesStep";
import { OnboardSummary } from "@/components/super-admin/societies/onboard/OnboardSummary";
import { WingsStep } from "@/components/super-admin/societies/onboard/WingsStep";
import { useOnboardForm } from "@/components/super-admin/societies/onboard/useOnboardForm";
import { useAction } from "@/hooks/useAction";
import { societiesApi } from "@/lib/api/societies";

const STEPS = [
  { title: "Society details", pill: "1 Details", next: "Next: wings & units" },
  { title: "Wings & units", pill: "2 Wings & units", next: "Next: billing & admin" },
  { title: "Maintenance billing", pill: "3 Billing & admin", next: "Next: choose features" },
  { title: "Features", pill: "4 Features", next: "Create society" },
];

export default function OnboardSocietyPage() {
  const router = useRouter();
  const form = useOnboardForm();
  const [step, setStep] = useState(0);
  const create = useAction(() => societiesApi.create(form.payload()), {
    success: (s) => `${s.name} onboarded · code ${s.code}`,
    invalidate: [["societies"], ["dashboard"], ["society-admins"]],
    onSuccess: () => router.push("/admin/societies"),
  });

  const stepValid = [form.valid.details, form.valid.wings, form.valid.billing, true][step];
  const next = () => (step === 3 ? create.mutate(undefined) : setStep(step + 1));

  return (
    <>
      <PageHeader
        breadcrumb="Societies / Onboard new"
        title="Onboard a society,"
        light="in 4 steps."
        actions={
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.pill}
                onClick={() => i < step && setStep(i)}
                className={clsx(
                  "h-[31px] rounded-[15.5px] px-3.5 text-[12px] font-semibold",
                  i === step ? "bg-violet text-white" : i < step ? "bg-ink text-white" : "bg-mist text-body",
                )}
              >
                {s.pill}
              </button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OnboardSummary form={form} />
        <Panel className="flex min-h-[707px] flex-col !border-ink">
          <h2 className="mb-3 text-[15px] font-bold leading-[19px] text-ink">{STEPS[step]!.title}</h2>
          <div className="flex-1">
            {step === 0 && <DetailsStep form={form} />}
            {step === 1 && <WingsStep form={form} />}
            {step === 2 && <BillingAdminStep form={form} />}
            {step === 3 && <FeaturesStep form={form} />}
          </div>
          <div className="mt-6 flex gap-2">
            <Button size="lg" variant="light" onClick={() => (step ? setStep(step - 1) : router.push("/admin/societies"))}>Back</Button>
            <Button size="lg" className="flex-1" disabled={!stepValid} loading={create.isPending} onClick={next}>{STEPS[step]!.next}</Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
