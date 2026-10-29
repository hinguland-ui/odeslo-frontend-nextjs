"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Chip, EmptyState, ErrorState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { PlaceCard } from "@/components/society-admin/worship/PlaceCard";
import { PlaceFormModal } from "@/components/society-admin/worship/PlaceFormModal";
import { useAction } from "@/hooks/useAction";
import { worshipApi, type WorshipPlace } from "@/lib/api/worship";
import { KindIcon } from "@/components/worship/KindIcon";
import { KINDS } from "@/lib/utils/worship";

export default function WorshipPlacesPage() {
  const [kind, setKind] = useState("all");
  const [editing, setEditing] = useState<WorshipPlace | null>(null);
  const [open, setOpen] = useState(false);
  const list = useQuery({ queryKey: ["worship"], queryFn: () => worshipApi.list() });
  const toggle = useAction((p: WorshipPlace) => worshipApi.update(p.id, { is_active: !p.is_active }), { success: "Updated", invalidate: [["worship"]] });
  const remove = useAction((p: WorshipPlace) => worshipApi.remove(p.id), { success: "Place removed", invalidate: [["worship"]] });

  const all = list.data ?? [];
  const items = kind === "all" ? all : all.filter((p) => p.kind === kind);
  const present = KINDS.filter((k) => all.some((p) => p.kind === k.value));

  return (
    <>
      <PageHeader
        title="Religious places,"
        light="for everyone in your society."
        subtitle="Temples, masjids, churches, gurudwaras... with their timings and photos."
        actions={<Button plus onClick={() => { setEditing(null); setOpen(true); }}>Add a place</Button>}
      />

      {all.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Chip size="sm" active={kind === "all"} onClick={() => setKind("all")}>All · {all.length}</Chip>
          {present.map((k) => <Chip key={k.value} size="sm" active={kind === k.value} onClick={() => setKind(k.value)}><KindIcon kind={k.value} size={15} className="mr-1.5" />{k.label}</Chip>)}
        </div>
      )}

      <div className="space-y-3">
        {list.isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-[200px] rounded-[24px]" />)}
        {list.error && <ErrorState error={list.error} onRetry={() => list.refetch()} />}
        {!list.isLoading && !list.error && items.length === 0 && (
          <Panel>
            <EmptyState
              title="No place added yet"
              hint="Add the mandir, masjid, church or gurudwara of your society so residents know the timings."
              action={<Button onClick={() => { setEditing(null); setOpen(true); }}>Add the first place</Button>}
            />
          </Panel>
        )}
        {items.map((p) => (
          <PlaceCard
            key={p.id}
            place={p}
            actions={
              <>
                <Button size="sm" variant="light" onClick={() => { setEditing(p); setOpen(true); }}>Edit</Button>
                <Button size="sm" variant="light" onClick={() => toggle.mutate(p)}>{p.is_active ? "Hide from residents" : "Show to residents"}</Button>
                <Button size="sm" variant="danger" onClick={() => window.confirm(`Remove ${p.name}? Its photos are deleted too.`) && remove.mutate(p)}>Remove</Button>
              </>
            }
          />
        ))}
      </div>

      <PlaceFormModal open={open} onClose={() => setOpen(false)} place={editing} />
    </>
  );
}
