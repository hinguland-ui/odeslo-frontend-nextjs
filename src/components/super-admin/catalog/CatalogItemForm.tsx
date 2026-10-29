"use client";

import clsx from "clsx";
import { useState } from "react";
import { DatePicker, Field, Input, Panel, Select, SelectMenu, Textarea } from "@/components/ui";
import { CategoryModal } from "@/components/super-admin/categories/CategoryModal";
import type { CategoryRow } from "@/lib/api/categories";
import type { Partner } from "@/lib/types/deal";
import type { Society } from "@/lib/types/society";
import { useCategories } from "@/hooks/useCategories";
import type { CatalogForm } from "./useCatalogForm";

/** Left card: what is being sold, by whom, when and where. */
export function CatalogItemForm({ form, partners, societies }: { form: CatalogForm; partners: Partner[]; societies: Society[] }) {
  const { f, set } = form;
  const cats = useCategories();
  const subs = cats.childrenOf(f.category);
  const parentRow = cats.tops.find((t) => t.key === f.category) ?? null;
  const [create, setCreate] = useState<{ parent: CategoryRow | null } | null>(null);
  const vendors = partners.filter((p) => p.verified && p.status === "active" && (!p.categories.length || p.categories.includes(f.category)));

  return (
    <Panel className="min-h-[709px]">
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
        <Field label="Item name"><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="RO Service" /></Field>
        <Field label="Category">
          <SelectMenu
            value={f.category}
            options={cats.tops.map((c) => ({ value: c.key, label: c.name }))}
            onChange={(v) => { set("category", v); set("subcategory", ""); }}
            createLabel="Create new category"
            onCreate={() => setCreate({ parent: null })}
          />
        </Field>
        <Field label="Sub-category" hint={subs.length ? "Optional. Helps vendors and residents find the exact service." : "No sub-categories yet for this category. You can add one right here."}>
          <SelectMenu
            value={f.subcategory}
            options={[{ value: "", label: "Any / not specific" }, ...subs.map((c) => ({ value: c.key, label: c.name }))]}
            onChange={(v) => set("subcategory", v)}
            createLabel={`Add sub-category${parentRow ? ` to ${parentRow.name}` : ""}`}
            onCreate={() => parentRow && setCreate({ parent: parentRow })}
            disabled={!parentRow}
          />
        </Field>
        <Field label="Vendor" hint={vendors.length ? undefined : "No verified vendor for this category yet"}>
          <Select value={f.partner_id} onChange={(e) => set("partner_id", e.target.value)}>
            <option value="">Assign later</option>
            {vendors.map((p) => <option key={p.id} value={p.id}>{p.business_name ?? p.name} · verified</option>)}
          </Select>
        </Field>
        <Field label="Capacity (max units)"><Input type="number" min={1} value={f.max_units} onChange={(e) => set("max_units", Number(e.target.value))} /></Field>
        <Field label="Service date"><DatePicker value={f.service_date} min={f.cutoff_date} onChange={(v) => set("service_date", v)} /></Field>
        <Field label="Booking cut-off"><DatePicker value={f.cutoff_date} max={f.service_date} onChange={(v) => set("cutoff_date", v)} /></Field>
        <Field label="Time slots (comma separated)" className="col-span-2"><Input value={f.slots} onChange={(e) => set("slots", e.target.value)} /></Field>
        <Field label="What's included" className="col-span-2">
          <Textarea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Filter check, membrane cleaning, TDS test, leak check. Spare parts billed separately." />
        </Field>
      </div>

      <p className="mb-1.5 mt-3 text-[12px] font-semibold leading-[15px] text-muted">Available in</p>
      <div className="flex flex-wrap gap-1.5">
        {[{ id: "", name: "All societies" }, ...societies.filter((s) => s.status === "active").map((s) => ({ id: String(s.id), name: s.name }))].map((s) => (
          <button key={s.id} type="button" onClick={() => set("society_id", s.id)}
            className={clsx("h-[31px] rounded-[15.5px] px-3 text-[12px] font-semibold transition", f.society_id === s.id ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line")}>
            {s.name}
          </button>
        ))}
      </div>
      {create && (
        <CategoryModal
          mode="create"
          parent={create.parent}
          tops={cats.tops}
          onClose={() => setCreate(null)}
          onSaved={(row) => {
            if (row.parent_id === null) { set("category", row.key); set("subcategory", ""); }
            else { set("subcategory", row.key); }
          }}
        />
      )}
    </Panel>
  );
}
