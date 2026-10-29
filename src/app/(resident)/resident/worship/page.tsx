"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { PlaceCard } from "@/components/society-admin/worship/PlaceCard";
import { worshipApi } from "@/lib/api/worship";

export default function ResidentWorshipPage() {
  const list = useQuery({ queryKey: ["worship"], queryFn: () => worshipApi.list() });
  const items = list.data ?? [];
  return (
    <>
      <PageHeader title="Religious places," light="in your society." />
      <div className="space-y-3">
        {list.isLoading && <Skeleton className="h-[200px] rounded-[24px]" />}
        {list.error && <ErrorState error={list.error} onRetry={() => list.refetch()} />}
        {!list.isLoading && !list.error && items.length === 0 && <Panel><EmptyState title="Nothing added yet" hint="Your society admin can add the mandir, masjid, church or gurudwara here." /></Panel>}
        {items.map((p) => <PlaceCard key={p.id} place={p} />)}
      </div>
    </>
  );
}
