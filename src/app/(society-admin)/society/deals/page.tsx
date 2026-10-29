"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, ChipGroup, PageHeader, Panel } from "@/components/ui";
import { DealsTable } from "@/components/society-admin/deals/DealsTable";
import { dealsApi } from "@/lib/api/deals";

type Tab = "live" | "draft" | "closed" | "completed" | "cancelled" | "all";

const MATCH: Record<Tab, (s: string) => boolean> = {
  live: (s) => s === "published" || s === "full",
  draft: (s) => s === "draft",
  closed: (s) => s === "closed",
  completed: (s) => s === "completed",
  cancelled: (s) => s === "cancelled",
  all: () => true,
};

export default function DealsPage() {
  const [tab, setTab] = useState<Tab>("live");
  const deals = useQuery({ queryKey: ["deals", "live"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const all = deals.data?.items ?? [];
  const count = (t: Tab) => all.filter((d) => MATCH[t](d.status)).length;

  return (
    <>
      <PageHeader
        title="Group deals,"
        light={`${count("live")} live.`}
        subtitle="Bundle demand from residents, then award one vendor."
        actions={<Button plus href="/society/deals/new">Launch group deal</Button>}
      />
      <ChipGroup
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={(["live", "draft", "closed", "completed", "cancelled", "all"] as Tab[]).map((t) => ({
          value: t,
          label: `${t[0]!.toUpperCase()}${t.slice(1)} · ${count(t)}`,
        }))}
      />
      <Panel className="min-h-[600px]">
        <DealsTable deals={all.filter((d) => MATCH[tab](d.status))} loading={deals.isLoading} hrefFor={(d) => `/society/deals/${d.id}`} />
      </Panel>
    </>
  );
}
