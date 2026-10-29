"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, ChipGroup, PageHeader, SearchInput } from "@/components/ui";
import { SocietiesTable } from "@/components/super-admin/societies/SocietiesTable";
import { societiesApi } from "@/lib/api/societies";

type Filter = "all" | "active" | "pending" | "suspended";

function SocietiesScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>((params.get("status") as Filter) ?? "all");
  const [q, setQ] = useState("");
  const societies = useQuery({ queryKey: ["societies"], queryFn: () => societiesApi.list() });

  const all = societies.data?.items ?? [];
  const count = (s: Filter) => (s === "all" ? all.length : all.filter((x) => x.status === s).length);
  const needle = q.trim().toLowerCase();
  const rows = all.filter(
    (s) =>
      (filter === "all" || s.status === filter) &&
      (!needle || [s.name, s.code, s.city, s.area].some((v) => v?.toLowerCase().includes(needle))),
  );

  return (
    <>
      <PageHeader title="Societies," light={`${all.length} on Odeslo.`} actions={<Button plus href="/admin/societies/new">Onboard society</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchInput value={q} onChange={setQ} placeholder="Society, code or city" className="!h-11 w-[300px] !rounded-[22px]" />
        <ChipGroup
          value={filter}
          onChange={setFilter}
          options={(["all", "active", "pending", "suspended"] as Filter[]).map((v) => ({
            value: v,
            label: `${v === "all" ? "All" : v[0]!.toUpperCase() + v.slice(1)} · ${count(v)}`,
          }))}
        />
      </div>
      <SocietiesTable rows={rows} loading={societies.isLoading} onOpen={(s) => router.push(`/admin/societies/${s.id}`)} />
    </>
  );
}

export default function SocietiesPage() {
  return (
    <Suspense>
      <SocietiesScreen />
    </Suspense>
  );
}
