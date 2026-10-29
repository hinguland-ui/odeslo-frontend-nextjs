"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button, Field, FileInput, Input, Modal } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { partnersApi } from "@/lib/api/deals";
import { useCategories } from "@/hooks/useCategories";

/** Multipart create: name, mobile, categories, ID proof and photo are required by the backend. */
export function AddVendorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const allCats = useCategories();
  const [form, setForm] = useState({ name: "", business_name: "", mobile: "", email: "", gst: "" });
  const [cats, setCats] = useState<string[]>([]);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = useAction(
    () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      cats.forEach((c) => fd.append("categories", c));
      fd.append("id_proof", idProof!);
      fd.append("photo", photo!);
      return partnersApi.create(fd);
    },
    { success: "Vendor added — verify them to start assigning jobs", invalidate: [["partners"]], onSuccess: onClose },
  );

  const valid = form.name.length > 1 && /^\d{10}$/.test(form.mobile) && cats.length > 0 && idProof && photo;

  return (
    <Modal open={open} onClose={onClose} title="Add vendor" subtitle="Service partner who fulfils group deals" width={560}
      footer={<><Button variant="light" onClick={onClose}>Cancel</Button><Button disabled={!valid} loading={create.isPending} onClick={() => create.mutate(undefined)}>Add vendor</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Owner name"><Input value={form.name} onChange={set("name")} /></Field>
        <Field label="Business name"><Input value={form.business_name} onChange={set("business_name")} /></Field>
        <Field label="Mobile"><Input value={form.mobile} maxLength={10} inputMode="numeric" onChange={set("mobile")} /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} /></Field>
        <Field label="GST number"><Input value={form.gst} onChange={set("gst")} /></Field>
        <div />
        <Field label="ID proof"><FileInput file={idProof} onChange={setIdProof} accept="image/*,.pdf" /></Field>
        <Field label="Photo"><FileInput file={photo} onChange={setPhoto} accept="image/*" /></Field>
      </div>
      <p className="mb-1.5 mt-3 text-[12px] font-semibold text-muted">Categories</p>
      <div className="flex flex-wrap gap-1.5">
        {allCats.keys.map((c) => (
          <button key={c} type="button" onClick={() => setCats((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))}
            className={clsx("h-[31px] rounded-[15.5px] px-3 text-[12px] font-semibold", cats.includes(c) ? "bg-ink text-white" : "bg-mist text-ink")}>
            {allCats.tops.find((t) => t.key === c)?.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}
