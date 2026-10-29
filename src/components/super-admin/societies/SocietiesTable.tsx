"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Avatar, Button, CellTitle, DataTable, EmptyState, StatusBadge, type Column } from "@/components/ui";
import { dashboardApi } from "@/lib/api/dashboard";
import { dealsApi } from "@/lib/api/deals";
import { societiesApi } from "@/lib/api/societies";
import type { Society } from "@/lib/types/society";
import { initials, inrShort, num } from "@/lib/utils/format";
import { toneFor } from "@/lib/utils/tones";

export function SocietiesTable({ rows, loading, onOpen }: { rows: Society[]; loading: boolean; onOpen: (s: Society) => void }) {
  const admins = useQuery({ queryKey: ["society-admins"], queryFn: () => societiesApi.admins() });
  const deals = useQuery({ queryKey: ["deals", "all"], queryFn: () => dealsApi.list({ include_platform: true }) });
  const report = useQuery({ queryKey: ["reports", "bookings"], queryFn: () => dashboardApi.bookingsReport() });
  const details = useQueries({
    queries: rows.map((s) => ({ queryKey: ["society", s.id], queryFn: () => societiesApi.get(s.id), staleTime: 60_000 })),
  });
  const stats = new Map(details.map((d) => [d.data?.id, d.data?.stats]));

  const primary = (id: number) => admins.data?.find((a) => a.society_id === id && a.role === "primary" && a.status === "active")?.name;
  const gmv = (id: number) => report.data?.filter((r) => r.society_id === id && r.status !== "cancelled").reduce((s, r) => s + r.amount, 0) ?? 0;
  const dealCount = (id: number) => deals.data?.items.filter((d) => d.society_id === id).length ?? 0;

  const columns: Column<Society>[] = [
    {
      key: "n", header: "Society", width: "1.7fr",
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <Avatar label={initials(s.name, 3)} tone={toneFor(s.code)} size={34} shape="rounded" />
          <CellTitle title={s.name} sub={`Code ${s.code}`} />
        </div>
      ),
    },
    { key: "c", header: "City", width: "0.85fr", render: (s) => <span className="text-body">{s.city}</span> },
    { key: "u", header: "Units", width: "0.65fr", render: (s) => num(stats.get(s.id)?.units) },
    { key: "r", header: "Residents", width: "0.75fr", render: (s) => (stats.get(s.id)?.active_residents ? num(stats.get(s.id)!.active_residents) : "—") },
    { key: "a", header: "Primary admin", width: "1.1fr", render: (s) => <span className="text-body">{primary(s.id) ?? "Awaiting admin"}</span> },
    { key: "g", header: "Deals · GMV", width: "0.8fr", render: (s) => <span className="font-semibold">{dealCount(s.id) ? `${dealCount(s.id)} · ${inrShort(gmv(s.id))}` : "—"}</span> },
    { key: "s", header: "Status", width: "0.8fr", render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(s) => s.id}
      loading={loading}
      rowHeight={55}
      onRowClick={onOpen}
      className="min-h-[652px]"
      empty={<EmptyState title="No societies match" action={<Button size="sm" href="/admin/societies/new">Onboard society</Button>} />}
    />
  );
}
