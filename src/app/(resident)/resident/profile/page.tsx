"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageLoader } from "@/components/ui/Preloader";
import { Badge, Button, EmptyState, Field, Input, KeyValue, Modal, Note, PageHeader, Panel, PanelTitle, Select, Toggle } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { residentApi } from "@/lib/api/resident";
import type { ResidentDetail } from "@/lib/types/resident";
import { fullDate, titleCase } from "@/lib/utils/format";

const digits = (v: string) => v.replace(/\D/g, "").slice(0, 10);

function PersonalForm({ me }: { me: ResidentDetail }) {
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email ?? "");
  const [ecName, setEcName] = useState(me.emergency_contact_name ?? "");
  const [ecMobile, setEcMobile] = useState(me.emergency_contact_mobile ?? "");
  const save = useAction(
    () => residentApi.updateMe({ name: name.trim(), email: email.trim() || null, emergency_contact_name: ecName.trim() || null, emergency_contact_mobile: ecMobile || null }),
    { invalidate: [["resident"], ["me"]], success: "Profile saved" },
  );
  return (
    <Panel>
      <PanelTitle>Personal details</PanelTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Emergency contact name"><Input value={ecName} onChange={(e) => setEcName(e.target.value)} /></Field>
        <Field label="Emergency contact mobile"><Input inputMode="numeric" value={ecMobile} onChange={(e) => setEcMobile(digits(e.target.value))} /></Field>
      </div>
      <div className="mt-5 flex justify-end"><Button loading={save.isPending} disabled={name.trim().length < 2} onClick={() => save.mutate(undefined)}>Save changes</Button></div>
    </Panel>
  );
}

function FamilyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [mobile, setMobile] = useState("");
  const [access, setAccess] = useState(false);
  const add = useAction(() => residentApi.addFamily({ name: name.trim(), relation: relation.trim(), mobile: mobile || null, grant_app_access: access }), { invalidate: [["resident"]], success: "Family member added", onSuccess: onClose });
  return (
    <Modal open onClose={onClose} title="Add family member" footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={add.isPending} disabled={name.trim().length < 2 || relation.trim().length < 2 || (access && mobile.length !== 10)} onClick={() => add.mutate(undefined)}>Add</Button></>}>
      <div className="space-y-4">
        <Field label="Name"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Relation"><Input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Spouse, Son, Mother…" /></Field>
        <Field label="Mobile (optional)"><Input inputMode="numeric" value={mobile} onChange={(e) => setMobile(digits(e.target.value))} /></Field>
        <div className="flex items-center justify-between rounded-[14px] bg-mist px-3.5 py-3">
          <div><p className="text-[13px] font-semibold text-ink">Give app access</p><p className="text-[11px] text-muted">They can sign in with their mobile (needs a number).</p></div>
          <Toggle checked={access} onChange={setAccess} />
        </div>
      </div>
    </Modal>
  );
}

function VehicleModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("car");
  const [number, setNumber] = useState("");
  const [slot, setSlot] = useState("");
  const add = useAction(() => residentApi.addVehicle({ vehicle_type: type, vehicle_number: number.trim(), parking_slot: slot.trim() || null }), { invalidate: [["resident"]], success: "Vehicle added", onSuccess: onClose });
  return (
    <Modal open onClose={onClose} title="Add vehicle" footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={add.isPending} disabled={number.trim().length < 4} onClick={() => add.mutate(undefined)}>Add</Button></>}>
      <div className="space-y-4">
        <Field label="Type"><Select value={type} onChange={(e) => setType(e.target.value)}>{["car", "bike", "scooter", "other"].map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}</Select></Field>
        <Field label="Vehicle number"><Input autoFocus value={number} onChange={(e) => setNumber(e.target.value.toUpperCase())} placeholder="RJ14AB1234" /></Field>
        <Field label="Parking slot (optional)"><Input value={slot} onChange={(e) => setSlot(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function TenantModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);
  const add = useAction(() => residentApi.addTenant({ name: name.trim(), mobile, email: email.trim() || null, maintenance_visible: visible }), { invalidate: [["resident"]], success: "Tenant added", onSuccess: onClose });
  return (
    <Modal open onClose={onClose} title="Add tenant" footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button loading={add.isPending} disabled={name.trim().length < 2 || mobile.length !== 10} onClick={() => add.mutate(undefined)}>Add tenant</Button></>}>
      <div className="space-y-4">
        <Field label="Tenant name"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Mobile"><Input inputMode="numeric" value={mobile} onChange={(e) => setMobile(digits(e.target.value))} /></Field>
        <Field label="Email (optional)"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <div className="flex items-center justify-between rounded-[14px] bg-mist px-3.5 py-3">
          <div><p className="text-[13px] font-semibold text-ink">Show maintenance bills</p><p className="text-[11px] text-muted">Let the tenant see and pay maintenance.</p></div>
          <Toggle checked={visible} onChange={setVisible} />
        </div>
      </div>
    </Modal>
  );
}

export default function ResidentProfilePage() {
  const [modal, setModal] = useState<"family" | "vehicle" | "tenant" | null>(null);
  const me = useQuery({ queryKey: ["resident", "me"], queryFn: residentApi.me });
  const home = useQuery({ queryKey: ["resident", "home"], queryFn: residentApi.home });
  const active = me.data?.status === "active";
  const family = useQuery({ queryKey: ["resident", "family"], queryFn: residentApi.family, enabled: active });
  const vehicles = useQuery({ queryKey: ["resident", "vehicles"], queryFn: residentApi.vehicles, enabled: active });
  const society = useQuery({ queryKey: ["resident", "society"], queryFn: residentApi.mySociety, enabled: active });
  const rmFamily = useAction((id: number) => residentApi.removeFamily(id), { invalidate: [["resident"]], success: "Removed" });
  const rmVehicle = useAction((id: number) => residentApi.removeVehicle(id), { invalidate: [["resident"]], success: "Removed" });

  const m = me.data;
  const isOwner = m?.resident_type === "owner";
  const canAddFamily = m?.resident_type !== "family";

  return (
    <>
      <PageHeader title="Profile," light="your details, family and vehicles." />
      {me.isLoading && <PageLoader minHeight={360} />}
      {!me.isLoading && !m && <EmptyState title="Could not load your profile" />}
      {m && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <PersonalForm key={m.id + m.name + String(m.email)} me={m} />

            {active && (
              <Panel>
                <PanelTitle aside={canAddFamily && <button className="font-semibold text-lilac-fg hover:underline" onClick={() => setModal("family")}>+ Add member</button>}>Family members</PanelTitle>
                {family.data?.length ? (
                  <ul className="divide-y divide-mist">
                    {family.data.map((f) => (
                      <li key={f.id} className="flex items-center justify-between py-2.5">
                        <div><p className="text-[13px] font-semibold text-ink">{f.name}</p><p className="text-[11px] text-muted">{f.relation}{f.mobile ? ` · ${f.mobile}` : ""}</p></div>
                        <div className="flex items-center gap-3">
                          {f.linked_resident_id && <Badge tone="green" size="sm" dot={false}>App access</Badge>}
                          {isOwner && <button className="text-[11px] font-semibold text-pink-fg hover:underline" onClick={() => rmFamily.mutate(f.id)}>Remove</button>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <EmptyState title="No family members added" />}
              </Panel>
            )}

            {active && (
              <Panel>
                <PanelTitle aside={<button className="font-semibold text-lilac-fg hover:underline" onClick={() => setModal("vehicle")}>+ Add vehicle</button>}>Vehicles</PanelTitle>
                {vehicles.data?.length ? (
                  <ul className="divide-y divide-mist">
                    {vehicles.data.map((v) => (
                      <li key={v.id} className="flex items-center justify-between py-2.5">
                        <div><p className="text-[13px] font-semibold text-ink">{v.vehicle_number}</p><p className="text-[11px] text-muted">{titleCase(v.vehicle_type)}{v.parking_slot ? ` · Slot ${v.parking_slot}` : ""}</p></div>
                        <button className="text-[11px] font-semibold text-pink-fg hover:underline" onClick={() => rmVehicle.mutate(v.id)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                ) : <EmptyState title="No vehicles added" />}
              </Panel>
            )}
          </div>

          <div className="space-y-4">
            <Panel variant="soft" as="aside" className="flex flex-col gap-3">
              <PanelTitle>Account</PanelTitle>
              <KeyValue label="Mobile" value={m.mobile} />
              <KeyValue label="Flat" value={home.data?.unit.label ?? `${m.wing_name ?? ""}-${m.unit_no ?? ""}`} />
              <KeyValue label="Type" value={titleCase(m.resident_type)} />
              <div className="flex items-center justify-between text-[12px]"><span className="text-body">Status</span><Badge tone={m.status === "active" ? "green" : m.status === "rejected" ? "pink" : "yellow"}>{m.status === "active" ? "Approved" : titleCase(m.status)}</Badge></div>
              {m.approved_at && <KeyValue label="Approved on" value={fullDate(m.approved_at)} />}
              {m.rejection_reason && <Note tone="pink">Reason: {m.rejection_reason}</Note>}
              {isOwner && active && <Button variant="light" onClick={() => setModal("tenant")}>Add tenant</Button>}
            </Panel>

            {society.data && (
              <Panel variant="soft" as="aside" className="flex flex-col gap-3">
                <PanelTitle>{society.data.society.name}</PanelTitle>
                <p className="text-[12px] leading-4 text-body">{society.data.society.address}, {society.data.society.area}, {society.data.society.city} {society.data.society.pincode}</p>
                <KeyValue label="Flats" value={society.data.stats.units} />
                <KeyValue label="Wings" value={society.data.stats.wings} />
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Committee</p>
                {society.data.committee.map((c) => (
                  <div key={c.name + c.mobile} className="rounded-[14px] bg-white px-3 py-2 text-[12px] leading-4">
                    <p className="font-semibold text-ink">{c.name} <span className="font-normal text-muted">· {titleCase(c.designation)}</span></p>
                    {c.mobile && <p className="text-body">{c.mobile}</p>}
                  </div>
                ))}
              </Panel>
            )}
          </div>
        </div>
      )}
      {modal === "family" && <FamilyModal onClose={() => setModal(null)} />}
      {modal === "vehicle" && <VehicleModal onClose={() => setModal(null)} />}
      {modal === "tenant" && <TenantModal onClose={() => setModal(null)} />}
    </>
  );
}
