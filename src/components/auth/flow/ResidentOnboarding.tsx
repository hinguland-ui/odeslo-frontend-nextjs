"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button, Chip, Field, FileInput, Input, MapView, Select, type MapMarker } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { currentPosition } from "@/lib/maps/geocode";
import { publicApi, residentApi } from "@/lib/api/resident";
import type { AuthResponse } from "@/lib/types/auth";
import type { PublicSociety } from "@/lib/types/portal";
import { titleCase } from "@/lib/utils/format";
import { errorText } from "../finishLogin";
import { FlowHeader } from "./FlowHeader";
import { Check } from "lucide-react";

export type Kind = "owner" | "tenant" | "family";
const PROOF: Record<Kind, { label: string; docs: { value: string; label: string }[] }> = {
  owner: { label: "Ownership proof", docs: [{ value: "index_ii", label: "Index II" }, { value: "sale_deed", label: "Sale deed" }, { value: "electricity_bill", label: "Electricity bill" }] },
  tenant: { label: "Rent agreement", docs: [{ value: "rent_agreement", label: "Rent agreement" }] },
  family: { label: "ID proof", docs: [{ value: "id_proof", label: "ID proof (Aadhaar / PAN / licence)" }] },
};
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 10);

/** New resident: find society → your flat & proof → contact details → sent for admin approval. */
export interface OnboardingInitial {
  society?: PublicSociety;
  wingId?: number;
  unitId?: number;
  kind: Kind;
  name: string;
  email?: string | null;
  ecName?: string | null;
  ecMobile?: string | null;
}

export function ResidentOnboarding({
  mobile,
  token,
  onCancel,
  onError,
  onRegistered,
  initial,
  addHome,
  resume,
  onProgress,
  stepBase = 0,
  stepTotal = 3,
  onStep,
}: {
  mobile: string;
  token: string;
  /** Prefill (and skip the society step) when a rejected resident applies again. */
  initial?: OnboardingInitial;
  /** A signed-in resident adds one more home. Their session stays as it is; the new society's admin approves. */
  addHome?: boolean;
  /** Where a new resident stopped last time (typed details only, files are never kept). */
  resume?: { step: number; data: Record<string, unknown> };
  /** Called (debounced) when the details change, to save the draft. */
  onProgress?: (step: number, data: Record<string, unknown>) => void;
  /** The wizard is part of a longer flow: "Step 4 of 6". */
  stepBase?: number;
  stepTotal?: number;
  /** Reports the current wizard step (used for the page URL). */
  onStep?: (step: number) => void;
  onCancel: () => void;
  onError: (msg: string) => void;
  /** Stores the session and returns where the resident should go next. */
  onRegistered: (res: AuthResponse) => string;
}) {
  const saved = (resume?.data ?? {}) as { society?: PublicSociety; wingId?: string; unitId?: string; kind?: Kind; docType?: string; name?: string; email?: string; ecName?: string; ecMobile?: string };
  const [step, setStep] = useState(Math.min(3, Math.max(1, resume?.step ?? (initial?.society ? 2 : 1))));
  useEffect(() => { onStep?.(step); }, [step, onStep]);
  const [q, setQ] = useState("");
  const [near, setNear] = useState<{ lat: number; lng: number } | null>(null);
  const [code, setCode] = useState("");
  const [society, setSociety] = useState<PublicSociety | null>(initial?.society ?? saved.society ?? null);
  const [preview, setPreview] = useState<PublicSociety | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number; key: number } | null>(null);
  const [wingId, setWingId] = useState(initial?.wingId ? String(initial.wingId) : saved.wingId ?? "");
  const [unitId, setUnitId] = useState(initial?.unitId ? String(initial.unitId) : saved.unitId ?? "");
  const [kind, setKind] = useState<Kind>(initial?.kind ?? saved.kind ?? "owner");
  const [docType, setDocType] = useState(saved.docType ?? PROOF[initial?.kind ?? saved.kind ?? "owner"].docs[0]!.value);
  const [proof, setProof] = useState<File | null>(null);
  const [name, setName] = useState(initial?.name ?? saved.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? saved.email ?? "");
  const [ecName, setEcName] = useState(initial?.ecName ?? saved.ecName ?? "");
  const [ecMobile, setEcMobile] = useState(initial?.ecMobile ?? saved.ecMobile ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ path: string; proofFailed: boolean } | null>(null);

  const societies = useQuery({ queryKey: ["public", "societies", q, near], queryFn: () => publicApi.searchSocieties(q.trim(), near ?? undefined), enabled: step === 1 });
  const wings = useQuery({ queryKey: ["public", "wings", society?.id], queryFn: () => publicApi.wings(society!.id), enabled: !!society });
  const units = useQuery({ queryKey: ["public", "units", wingId], queryFn: () => publicApi.units(Number(wingId)), enabled: !!wingId });
  const wing = wings.data?.find((w) => String(w.id) === wingId);
  // owner / tenant: only vacant flats. family: only flats that already have a household.
  const selectable = (u: { occupancy_status: string }) => (kind === "family" ? u.occupancy_status !== "vacant" : u.occupancy_status === "vacant");
  const freeUnits = units.data?.filter(selectable) ?? [];
  const hiddenCount = (units.data?.length ?? 0) - freeUnits.length;
  // a prefilled flat that someone else has taken since must not stay selected
  const unitChoice = units.data && unitId && !freeUnits.some((u) => String(u.id) === unitId) ? "" : unitId;
  const unit = units.data?.find((u) => String(u.id) === unitChoice);

  // save the draft a moment after the person stops typing, so closing the tab loses nothing
  useEffect(() => {
    if (!onProgress || done || (!society && !name)) return;
    const t = setTimeout(() => onProgress(step, { society, wingId, unitId, kind, docType, name, email, ecName, ecMobile }), 600);
    return () => clearTimeout(t);
  }, [step, society, wingId, unitId, kind, docType, name, email, ecName, ecMobile, done, onProgress]);

  const showOnMap = (s: PublicSociety) => {
    setPreview(s);
    if (s.lat != null && s.lng != null) setFocus({ lat: s.lat, lng: s.lng, zoom: 16, key: Date.now() });
  };
  const pick = (s: PublicSociety) => { setSociety(s); setWingId(""); setUnitId(""); setStep(2); };
  const locate = async () => {
    try {
      onError("");
      const p = await currentPosition();
      setNear(p);
      setFocus({ ...p, zoom: 14, key: Date.now() });
    } catch (e) {
      onError(errorText(e));
    }
  };
  const findByCode = async (c = code) => {
    try { onError(""); const f = await publicApi.byCode(c); showOnMap(f); } catch (e) { onError(errorText(e)); }
  };
  // a shared join link (/join?code=ABC123) arrives with the code: look the society up and show it selected
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code")?.toUpperCase();
    if (!c || initial?.society || saved.society) return;
    publicApi.byCode(c).then((f) => { setCode(c); showOnMap(f); }).catch((e) => onError(errorText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setKindAndDoc = (k: Kind) => { setKind(k); setUnitId(""); setDocType(PROOF[k].docs[0]!.value); };

  const submit = async () => {
    setBusy(true);
    onError("");
    try {
      const body = { society_id: society!.id, wing_id: Number(wingId), unit_id: Number(unitChoice), resident_type: kind, name: name.trim(), email: email.trim() || null, emergency_contact_name: ecName.trim() || null, emergency_contact_mobile: ecMobile || null };
      let proofFailed = false;
      let path: string;
      if (addHome) {
        // same login, one more home: the proof is attached to the new home, not the one we are signed in to
        const home = await residentApi.addHome(body);
        if (proof) await residentApi.uploadDocument(docType, proof, home.id).catch(() => { proofFailed = true; });
        path = "/resident/home";
      } else {
        const res = await authApi.registerResident(body, token);
        path = onRegistered(res); // session is saved here, so the upload below is authenticated
        if (proof) await residentApi.uploadDocument(docType, proof).catch(() => { proofFailed = true; });
      }
      setDone({ path, proofFailed });
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div>
        <FlowHeader title={addHome ? "Sent to the admin," : initial ? "Sent again," : "Request sent,"} light="almost there." subtitle={addHome ? `You will get a message here when ${society?.name} approves this home. Then switch to it from the top of the menu.` : "Your society admin will verify your details and approve your flat."} />
        <ol className="space-y-3 rounded-[20px] bg-panel p-4">
          {[
            { t: addHome ? "New home requested" : initial ? "Request sent again" : "Request sent", s: `${titleCase(kind)} · ${wing?.name}-${unit?.unit_no} · ${society?.name}`, on: true },
            { t: "Admin verifies", s: "Usually within a day. You will get a message when it is done.", on: false },
            { t: addHome ? "Switch to it" : "Full access", s: addHome ? "Your data, deals and bills change to that home when you switch." : "Group deals, maintenance, complaints and more open up.", on: false },
          ].map((x) => (
            <li key={x.t} className="flex gap-3">
              <span className={clsx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold", x.on ? "bg-green-fg text-white" : "bg-line text-muted")}>{x.on ? <Check size={12} strokeWidth={3.2} /> : "•"}</span>
              <div><p className="text-[13px] font-semibold text-ink">{x.t}</p><p className="text-[12px] leading-4 text-muted">{x.s}</p></div>
            </li>
          ))}
        </ol>
        {done.proofFailed && <p className="mt-3 rounded-[14px] bg-yellow-bg px-3 py-2 text-[12px] font-medium text-yellow-fg">Your proof could not be uploaded. You can send it again later from Profile.</p>}
        <Button block size="lg" className="mt-5" onClick={() => (window.location.href = done.path)}>{addHome ? "Back to my home" : "Open my home"}</Button>
      </div>
    );

  if (step === 1) {
    const list = societies.data ?? [];
    const markers: MapMarker[] = [
      ...list.filter((x) => x.lat != null).map((x) => ({ id: x.id, lat: x.lat!, lng: x.lng!, label: x.name, selected: x.id === preview?.id })),
      ...(preview && !list.some((x) => x.id === preview.id) && preview.lat != null ? [{ id: preview.id, lat: preview.lat, lng: preview.lng!, label: preview.name, selected: true }] : []),
      ...(near ? [{ id: "me", lat: near.lat, lng: near.lng, label: "You are here", tone: "blue" as const }] : []),
    ];
    return (
      <div>
        <FlowHeader step={stepBase + 1} total={stepTotal} onBack={onCancel} title="Find your" light="society." subtitle={addHome ? "Pick the society of your other home on the map or search below." : `+91 ${mobile} is new here. Tap your society on the map or search below.`} />
        <MapView
          markers={markers}
          fit={!focus}
          focus={focus}
          height={320}
          pitch={0}
          onMarkerClick={(id) => { const f = list.find((x) => x.id === id); if (f) showOnMap(f); }}
        />
        <div className="mt-3 flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Society name or area" />
          <Button variant="light" onClick={locate} className="shrink-0">{near ? <span className="inline-flex items-center gap-1.5">Near me <Check size={14} strokeWidth={3} /></span> : "Near me"}</Button>
        </div>

        {preview ? (
          <div className="mt-3 rounded-[20px] border border-ink bg-white p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Selected society</p>
            <p className="mt-1 text-[15px] font-bold leading-[19px] text-ink">{preview.name}</p>
            <p className="text-[12px] text-muted">{preview.area}, {preview.city} · Code {preview.code}{preview.distance_km != null ? ` · ${preview.distance_km.toFixed(1)} km away` : ""}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="light" onClick={() => setPreview(null)}>Clear</Button>
              <Button className="flex-1" onClick={() => pick(preview)}>Continue with this society</Button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            {list.length > 0 && <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.88px] text-muted">{near ? "Closest to you" : "Societies"} · {list.length}</p>}
            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1 scroll-thin">
            {societies.isLoading && <p className="px-1 text-[12px] text-muted">Searching…</p>}
            {list.map((x) => (
              <div key={x.id} className="group flex items-center gap-3 rounded-[18px] border border-line bg-white p-3 transition hover:border-ink hover:shadow-sm">
                <button type="button" onClick={() => showOnMap(x)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-mist text-[16px] font-bold text-ink">{x.name.charAt(0).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold leading-[18px] text-ink">{x.name}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted">{[x.area, x.city].filter(Boolean).join(", ")}</span>
                    <span className="mt-1.5 flex items-center gap-1.5">
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold tracking-wide text-body">{x.code}</span>
                      {x.distance_km != null && <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold text-body">{x.distance_km.toFixed(1)} km away</span>}
                      {x.lat == null && <span className="text-[10px] text-muted">No map pin</span>}
                    </span>
                  </span>
                </button>
                <Button size="sm" onClick={() => pick(x)} className="shrink-0">Select</Button>
              </div>
            ))}
            {societies.data?.length === 0 && <p className="rounded-[14px] bg-mist px-3 py-3 text-[12px] text-muted">No society found. Check the name or enter the society code below.</p>}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Have a society code? e.g. SHS001" />
          <Button variant="light" disabled={code.trim().length < 3} onClick={() => findByCode()} className="shrink-0">Find</Button>
        </div>
      </div>
    );
  }

  if (step === 2)
    return (
      <div>
        <FlowHeader step={stepBase + 2} total={stepTotal} onBack={() => setStep(1)} title="Where do" light="you live?" />
        <div className="mb-4 flex items-center justify-between rounded-[16px] bg-mist px-3.5 py-3">
          <span><span className="block text-[13px] font-bold text-ink">{society!.name}</span><span className="block text-[11px] text-muted">{society!.area}, {society!.city}</span></span>
          <button type="button" className="text-[11px] font-semibold text-lilac-fg hover:underline" onClick={() => setStep(1)}>Change</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wing / block">
            <Select value={wingId} onChange={(e) => { setWingId(e.target.value); setUnitId(""); }}>
              <option value="">Select…</option>
              {wings.data?.map((w) => <option key={w.id} value={w.id}>Wing {w.name}</option>)}
            </Select>
          </Field>
          <Field label="Unit number">
            <Select value={unitChoice} onChange={(e) => setUnitId(e.target.value)} disabled={!wingId}>
              <option value="">Select…</option>
              {freeUnits.map((u) => <option key={u.id} value={u.id}>{wing?.name}-{u.unit_no}</option>)}
            </Select>
          </Field>
        </div>
        {wingId && units.data && (
          <p className="mt-2 rounded-[14px] bg-mist px-3 py-2 text-[12px] leading-4 text-body">
            {freeUnits.length === 0
              ? kind === "family"
                ? "No flat in this wing has a registered household yet. Ask the owner to add you as a family member, or pick another wing."
                : "No vacant flat in this wing. Pick another wing, or contact your society admin."
              : kind === "family"
                ? `Showing flats that already have an approved household (${freeUnits.length}).`
                : `Showing ${freeUnits.length} vacant flat${freeUnits.length === 1 ? "" : "s"}. ${hiddenCount} already have an approved resident and are hidden.`}
          </p>
        )}
        <div className="mt-4">
          <Field label="I am the">
            <div className="flex gap-2">{(["owner", "tenant", "family"] as Kind[]).map((k) => <Chip key={k} active={kind === k} onClick={() => setKindAndDoc(k)}>{titleCase(k)}</Chip>)}</div>
          </Field>
        </div>
        <div className="mt-4"><Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="As on your ID" /></Field></div>
        <div className="mt-4">
          <Field label={`${PROOF[kind].label} (optional)`} hint="Helps the admin approve you faster. JPG, PNG or PDF.">
            {PROOF[kind].docs.length > 1 && (
              <div className="mb-2"><Select value={docType} onChange={(e) => setDocType(e.target.value)}>{PROOF[kind].docs.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Select></div>
            )}
            <FileInput file={proof} onChange={setProof} accept="image/*,application/pdf" placeholder="Upload document" />
          </Field>
        </div>
        <Button block size="lg" className="mt-5" disabled={!wingId || !unitChoice || name.trim().length < 2} onClick={() => setStep(3)}>Next</Button>
      </div>
    );

  return (
    <div>
      <FlowHeader step={stepBase + 3} total={stepTotal} onBack={() => setStep(2)} title="Contact &" light="review." subtitle="Your admin may use these to reach you or your family in an emergency." />
      <div className="space-y-4">
        <Field label="Email (optional)"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Emergency contact"><Input value={ecName} onChange={(e) => setEcName(e.target.value)} placeholder="Name" /></Field>
          <Field label="Their mobile"><Input inputMode="numeric" value={ecMobile} onChange={(e) => setEcMobile(digits(e.target.value))} placeholder="10-digit" /></Field>
        </div>
      </div>
      <div className="mt-5 space-y-1.5 rounded-[18px] bg-panel p-4 text-[12px]">
        {[["Name", name], ["Mobile", `+91 ${mobile}`], ["Society", society!.name], ["Flat", `${wing?.name}-${unit?.unit_no}`], ["As", titleCase(kind)], ["Proof", proof ? proof.name : "Not added"]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3"><span className="text-body">{k}</span><span className="truncate text-right font-bold text-ink">{v}</span></div>
        ))}
      </div>
      <Button block size="lg" className="mt-5" loading={busy} disabled={!!ecMobile && ecMobile.length !== 10} onClick={submit}>{initial && !addHome ? "Apply again" : "Send for approval"}</Button>
    </div>
  );
}
