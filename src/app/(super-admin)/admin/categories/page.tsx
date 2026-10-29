"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar, Button, EmptyState, PageHeader, Panel, Skeleton, Toggle } from "@/components/ui";
import { CategoryModal } from "@/components/super-admin/categories/CategoryModal";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { useCategories } from "@/hooks/useCategories";
import { categoriesApi, type CategoryRow } from "@/lib/api/categories";
import { categoryOf } from "@/lib/utils/categories";

type ModalState = { mode: "create"; parent?: CategoryRow | null } | { mode: "rename"; row: CategoryRow } | null;

function IconBtn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className={clsx("grid size-8 place-items-center rounded-full transition", danger ? "text-pink-fg hover:bg-pink-bg" : "text-muted hover:bg-mist hover:text-ink")}>
      {children}
    </button>
  );
}

/** Wraps any item so it can be dragged by its handle. */
function Sortable({ id, children, className }: { id: number; children: (handle: ReactNode, dragging: boolean) => ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button type="button" aria-label="Drag to reorder" title="Drag to reorder" {...attributes} {...listeners}
      className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted/70 transition hover:bg-mist hover:text-ink active:cursor-grabbing">
      <GripVertical size={16} />
    </button>
  );
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={clsx(className, isDragging && "relative z-20 opacity-90 shadow-2xl")}>
      {children(handle, isDragging)}
    </div>
  );
}

export default function CategoriesPage() {
  const cats = useCategories(true);
  const qc = useQueryClient();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const toggle = useAction((a: { id: number; active: boolean }) => categoriesApi.update(a.id, { active: a.active }), { invalidate: [["categories"]] });
  const remove = useAction((id: number) => categoriesApi.remove(id), { invalidate: [["categories"]], success: "Deleted" });

  const confirmDelete = (r: CategoryRow) => {
    if (window.confirm(`Delete "${r.name}"? This cannot be undone.`)) remove.mutate(r.id);
  };

  /** Move one item inside its sibling list: update the screen at once, then save the order. */
  const reorder = async (siblings: CategoryRow[], e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = siblings.findIndex((s) => s.id === e.active.id);
    const to = siblings.findIndex((s) => s.id === e.over!.id);
    const ids = arrayMove(siblings, from, to).map((s) => s.id);
    qc.setQueryData<CategoryRow[]>(["categories", "all"], (old) => (old ? [...old].sort((a, b) => (ids.includes(a.id) && ids.includes(b.id) ? ids.indexOf(a.id) - ids.indexOf(b.id) : 0)) : old));
    try {
      await categoriesApi.reorder(ids);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save the order", "error");
    }
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const subCount = cats.rows.length - cats.tops.length;

  return (
    <>
      <PageHeader
        title="Categories,"
        light={`${cats.tops.length} main · ${subCount} sub-categories.`}
        subtitle="Everything vendors can offer and societies can book. Drag the handle to reorder."
        actions={<Button plus onClick={() => setModal({ mode: "create" })}>New category</Button>}
      />

      {cats.isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[190px] rounded-[24px]" />)}</div>
      ) : !cats.tops.length ? (
        <Panel><EmptyState title="No categories yet" action={<Button size="sm" onClick={() => setModal({ mode: "create" })}>New category</Button>} /></Panel>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => reorder(cats.tops, e)}>
          <SortableContext items={cats.tops.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-2 2xl:grid-cols-3">
              {cats.tops.map((c) => {
                const look = categoryOf(c.key);
                const subs = cats.rows.filter((r) => r.parent_id === c.id);
                return (
                  <Sortable key={c.id} id={c.id}>
                    {(handle) => (
                      <Panel className={clsx("!p-4 transition", !c.active && "opacity-60")}>
                        <div className="flex items-center gap-2">
                          {handle}
                          <Avatar label={look.abbr} tone={look.tone} size={44} shape="rounded" />
                          <div className="min-w-0 flex-1 pl-1">
                            <p className="truncate text-[15px] font-bold leading-5 text-ink">{c.name}</p>
                            <p className="text-[12px] leading-4 text-muted">{c.deal_count} deal{c.deal_count === 1 ? "" : "s"} · {c.vendor_count} vendor{c.vendor_count === 1 ? "" : "s"}</p>
                          </div>
                          <Toggle checked={c.active} label={`${c.name} active`} onChange={(v) => toggle.mutate({ id: c.id, active: v })} />
                        </div>

                        <div className="mt-3.5 flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-[0.88px] text-muted">Sub-categories · {subs.length}</p>
                          <div className="flex items-center">
                            <IconBtn label="Rename" onClick={() => setModal({ mode: "rename", row: c })}><Pencil size={15} /></IconBtn>
                            <IconBtn label="Delete category" danger onClick={() => confirmDelete(c)}><Trash2 size={15} /></IconBtn>
                            <button type="button" onClick={() => setModal({ mode: "create", parent: c })} aria-label={`Add sub-category to ${c.name}`} title="Add sub-category"
                              className="ml-1 grid size-8 place-items-center rounded-full bg-ink text-white transition hover:bg-ink-soft"><Plus size={16} strokeWidth={2.6} /></button>
                          </div>
                        </div>

                        {subs.length ? (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => reorder(subs, e)}>
                            <SortableContext items={subs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                              <ul className="mt-2 space-y-1 rounded-[16px] bg-panel p-1.5">
                                {subs.map((s) => (
                                  <li key={s.id}>
                                    <Sortable id={s.id} className="rounded-[12px] bg-white">
                                      {(subHandle) => (
                                        <div className={clsx("flex items-center gap-1.5 py-1.5 pl-1 pr-2", !s.active && "opacity-60")}>
                                          {subHandle}
                                          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{s.name}</span>
                                          <span className="text-[11px] text-muted">{s.deal_count} deal{s.deal_count === 1 ? "" : "s"}</span>
                                          <Toggle checked={s.active} label={`${s.name} active`} onChange={(v) => toggle.mutate({ id: s.id, active: v })} />
                                          <IconBtn label="Rename" onClick={() => setModal({ mode: "rename", row: s })}><Pencil size={14} /></IconBtn>
                                          <IconBtn label="Delete" danger onClick={() => confirmDelete(s)}><Trash2 size={14} /></IconBtn>
                                        </div>
                                      )}
                                    </Sortable>
                                  </li>
                                ))}
                              </ul>
                            </SortableContext>
                          </DndContext>
                        ) : (
                          <button type="button" onClick={() => setModal({ mode: "create", parent: c })}
                            className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-line text-[12px] font-semibold text-muted transition hover:border-ink hover:text-ink">
                            <Plus size={14} /> Add the first sub-category
                          </button>
                        )}
                      </Panel>
                    )}
                  </Sortable>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modal && (
        <CategoryModal
          mode={modal.mode}
          row={modal.mode === "rename" ? modal.row : undefined}
          parent={modal.mode === "create" ? modal.parent : undefined}
          tops={cats.tops}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
