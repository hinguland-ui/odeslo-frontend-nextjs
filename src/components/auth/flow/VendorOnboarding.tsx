"use client";

import { useEffect, useState } from "react";
import { Button, Chip, Field, FileInput, Input } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { useCategories } from "@/hooks/useCategories";
import { errorText } from "../finishLogin";
import { FlowHeader } from "./FlowHeader";
import { Check } from "lucide-react";

/** New vendor: about you → services → documents → waits for Odeslo verification. */
export function VendorOnboarding({
  mobile,
  token,
  onCancel,
  onError,
  onBackToSignIn,
  resume,
  onProgress,
  stepBase = 0,
  stepTotal = 3,
  onStep,
}: {
  mobile: string;
  token: string;
  onCancel: () => void;
  onError: (msg: string) => void;
  onBackToSignIn: () => void;
  /** Where the person stopped last time (typed details only, files are never kept). */
  resume?: { step: number; data: Record<string, unknown> };
  /** Called (debounced) when the details change, to save the draft. */
  onProgress?: (step: number, data: Record<string, unknown>) => void;
  /** The wizard is part of a longer flow: "Step 4 of 6". */
  stepBase?: number;
  stepTotal?: number;
  /** Reports the current wizard step (used for the page URL). */
  onStep?: (step: number) => void;
}) {
  const r = (resume?.data ?? {}) as { name?: string; business?: string; email?: string; gst?: string; categories?: string[] };
  const cats = useCategories();
  const [step, setStep] = useState(Math.min(3, Math.max(1, resume?.step ?? 1)));
  useEffect(() => { onStep?.(step); }, [step, onStep]);
  const [name, setName] = useState(r.name ?? "");
  const [business, setBusiness] = useState(r.business ?? "");
  const [email, setEmail] = useState(r.email ?? "");
  const [gst, setGst] = useState(r.gst ?? "");
  const [categories, setCategories] = useState<string[]>(r.categories ?? []);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");

  useEffect(() => {
    if (!onProgress || doneMsg || (!name && !business && !email && !gst && !categories.length)) return;
    const t = setTimeout(() => onProgress(step, { name, business, email, gst, categories }), 600);
    return () => clearTimeout(t);
  }, [step, name, business, email, gst, categories, doneMsg, onProgress]);

  const toggle = (c: string) => setCategories((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const submit = async () => {
    setBusy(true);
    onError("");
    try {
      const form = new FormData();
      form.set("name", name.trim());
      categories.forEach((c) => form.append("categories", c));
      if (business.trim()) form.set("business_name", business.trim());
      if (email.trim()) form.set("email", email.trim());
      if (gst.trim()) form.set("gst", gst.trim());
      form.set("id_proof", idProof!);
      form.set("photo", photo!);
      const res = await authApi.registerVendor(form, token);
      setDoneMsg(res.message);
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (doneMsg)
    return (
      <div>
        <FlowHeader title="Registration" light="received." subtitle="We will verify your documents and assign societies to you." />
        <ol className="space-y-3 rounded-[20px] bg-panel p-4">
          {[
            { t: "Application sent", s: `${business.trim() || name.trim()} · +91 ${mobile}`, on: true },
            { t: "Odeslo verifies", s: "ID proof and business details are checked.", on: false },
            { t: "Societies assigned", s: "You start seeing deals and jobs, and can sign in here.", on: false },
          ].map((x) => (
            <li key={x.t} className="flex gap-3">
              <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${x.on ? "bg-green-fg text-white" : "bg-line text-muted"}`}>{x.on ? <Check size={12} strokeWidth={3.2} /> : "•"}</span>
              <div><p className="text-[13px] font-semibold text-ink">{x.t}</p><p className="text-[12px] leading-4 text-muted">{x.s}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[12px] leading-4 text-muted">{doneMsg}</p>
        <Button block size="lg" variant="light" className="mt-5" onClick={onBackToSignIn}>Back to sign in</Button>
      </div>
    );

  if (step === 1)
    return (
      <div>
        <FlowHeader step={stepBase + 1} total={stepTotal} onBack={onCancel} title="About" light="you." subtitle={`+91 ${mobile} is new here. Register as a vendor to get deals from societies.`} />
        <div className="space-y-4">
          <Field label="Your name"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
          <Field label="Business name (optional)"><Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Shop / company name" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email (optional)"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="GST (optional)"><Input value={gst} maxLength={15} onChange={(e) => setGst(e.target.value.toUpperCase())} /></Field>
          </div>
        </div>
        <Button block size="lg" className="mt-5" disabled={name.trim().length < 2} onClick={() => setStep(2)}>Next</Button>
      </div>
    );

  if (step === 2)
    return (
      <div>
        <FlowHeader step={stepBase + 2} total={stepTotal} onBack={() => setStep(1)} title="Your" light="services." subtitle="Pick everything you can do. You get deals only in these categories." />
        <div className="flex flex-wrap gap-2">
          {cats.tops.map((c) => <Chip key={c.key} active={categories.includes(c.key)} onClick={() => toggle(c.key)}>{c.name}</Chip>)}
        </div>
        <Button block size="lg" className="mt-5" disabled={categories.length === 0} onClick={() => setStep(3)}>Next · {categories.length} selected</Button>
      </div>
    );

  return (
    <div>
      <FlowHeader step={stepBase + 3} total={stepTotal} onBack={() => setStep(2)} title="Verify" light="yourself." subtitle="Documents are only used for verification and are never shown to residents." />
      <div className="space-y-4">
        <Field label="ID proof" hint="Aadhaar, PAN or driving licence (image or PDF)."><FileInput file={idProof} onChange={setIdProof} accept="image/*,application/pdf" placeholder="Upload ID proof" /></Field>
        <Field label="Your photo"><FileInput file={photo} onChange={setPhoto} accept="image/*" placeholder="Upload a clear photo" /></Field>
      </div>
      <Button block size="lg" className="mt-5" loading={busy} disabled={!idProof || !photo} onClick={submit}>Submit for verification</Button>
    </div>
  );
}
