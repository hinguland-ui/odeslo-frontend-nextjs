"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Chip, EmptyState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { CatalogCard } from "@/components/super-admin/catalog/CatalogCard";
import { CatalogItemModal } from "@/components/super-admin/catalog/CatalogItemModal";
import { useLookups } from "@/hooks/useLookups";
import { dealsApi, partnersApi } from "@/lib/api/deals";
import type { Deal } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";

type Filter = "all" | "platform" | "society" | "review" | `cat:${string}`;

export default function CatalogPage() {
  const look = useLookups();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Deal | null>(null);
  const deals = useQuery({ queryKey: ["catalog"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersApi.list() });

  const all = deals.data?.items ?? [];
  const vendor = (id: number | null) => {
    const p = partners.data?.items.find((x) => x.id === id);
    return p ? p.business_name ?? p.name : "No vendor yet";
  };
  const review = all.filter((d) => d.status === "draft" && d.society_id !== null);
  const categories = [...new Set(all.map((d) => d.category))];
  const rows = all.filter((d) =>
    filter === "all" ? true
    : filter === "platform" ? d.society_id === null
    : filter === "society" ? d.society_id !== null
    : filter === "review" ? d.status === "draft" && d.society_id !== null
    : d.category === filter.slice(4),
  );

  return (
    <>
      <PageHeader
        title="Catalog,"
        light={`${all.length} products & services.`}
        actions={
          <>
            <Button variant="warn" onClick={() => setFilter("review")}>Local items to approve · {review.length}</Button>
            <Button plus href="/admin/catalog/new">Add item</Button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip size="sm" active={filter === "all"} onClick={() => setFilter("all")}>All · {all.length}</Chip>
        <Chip size="sm" active={filter === "platform"} onClick={() => setFilter("platform")}>Platform · {all.filter((d) => d.society_id === null).length}</Chip>
        <Chip size="sm" active={filter === "society"} onClick={() => setFilter("society")}>Society deals · {all.filter((d) => d.society_id !== null).length}</Chip>
        {categories.map((c) => (
          <Chip key={c} size="sm" active={filter === `cat:${c}`} onClick={() => setFilter(`cat:${c}`)}>{categoryOf(c).label}</Chip>
        ))}
      </div>
      {deals.isLoading ? (
        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[187px] rounded-[22px]" />)}</div>
      ) : !rows.length ? (
        <Panel><EmptyState title="Nothing in this view" action={<Button size="sm" href="/admin/catalog/new">Add item</Button>} /></Panel>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          {rows.map((d) => (
            <CatalogCard key={d.id} deal={d} vendor={vendor(d.partner_id)} society={look.society(d.society_id)} onClick={() => setOpen(d)} />
          ))}
        </div>
      )}
      {open && <CatalogItemModal deal={open} vendor={vendor(open.partner_id)} society={look.society(open.society_id)} onClose={() => setOpen(null)} />}
    </>
  );
}
