"use client";

import { useState } from "react";
import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { categoriesApi, type CategoryRow } from "@/lib/api/categories";

/** Create a category / sub-category, or rename one. A sub-category always sits under a main category. */
export function CategoryModal({ mode, row, parent, tops, onClose, onSaved }: {
  mode: "create" | "rename";
  row?: CategoryRow;
  /** Pre-selected main category when opened from a card's "+" button. */
  parent?: CategoryRow | null;
  tops: CategoryRow[];
  onClose: () => void;
  /** Called with the new / renamed row, e.g. to select it in a dropdown straight away. */
  onSaved?: (row: CategoryRow) => void;
}) {
  const [name, setName] = useState(row?.name ?? "");
  const [parentId, setParentId] = useState<string>(parent ? String(parent.id) : "");
  const isSub = mode === "create" ? !!parentId : row?.parent_id != null;

  const save = useAction(
    () => (mode === "create" ? categoriesApi.create({ name: name.trim(), parent_id: parentId ? Number(parentId) : null }) : categoriesApi.update(row!.id, { name: name.trim() })),
    { invalidate: [["categories"]], success: mode === "create" ? `${isSub ? "Sub-category" : "Category"} added` : "Renamed", onSuccess: (r) => { onSaved?.(r); onClose(); } },
  );
  const valid = name.trim().length >= 2;

  return (
    <Modal
      open
      onClose={onClose}
      width={440}
      title={mode === "create" ? (parent ? `Add sub-category to ${parent.name}` : "New category") : `Rename ${row?.name}`}
      subtitle={mode === "create" ? "Vendors and deals can pick it straight away." : "Deals and vendors already using it stay linked."}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} loading={save.isPending} onClick={() => save.mutate(undefined)}>{mode === "create" ? "Add" : "Save"}</Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Field label={isSub ? "Sub-category name" : "Category name"}>
          <Input autoFocus value={name} maxLength={80} placeholder={isSub ? "e.g. Split AC service" : "e.g. Home security"} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && valid && !save.isPending && save.mutate(undefined)} />
        </Field>
        {mode === "create" && !parent && (
          <Field label="Under" hint="Leave as main category to create a top-level one.">
            <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">Main category (top level)</option>
              {tops.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
        )}
      </div>
    </Modal>
  );
}
