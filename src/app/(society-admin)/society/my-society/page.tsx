"use client";

import { PageLoader } from "@/components/ui/Preloader";
import { EmptyState, PageHeader, Panel, StatCard } from "@/components/ui";
import { DetailsCard } from "@/components/society-admin/my-society/DetailsCard";
import { JoinCodeCard } from "@/components/society-admin/my-society/JoinCodeCard";
import { LocationCard } from "@/components/society-admin/my-society/LocationCard";
import { useMe, useMySociety } from "@/hooks/useMe";

export default function MySocietyPage() {
  const me = useMe();
  const q = useMySociety();
  const s = q.data;
  // only the primary admin can edit the society profile (the backend enforces this too)
  const canEdit = (me.data?.role ?? "") === "primary";

  if (q.isLoading) return <PageLoader label="Loading your society" />;
  if (!s) return <Panel variant="soft"><EmptyState title="Could not load your society" /></Panel>;

  return (
    <>
      <PageHeader title={s.name} light="society profile." subtitle={`${s.area}, ${s.city} · Code ${s.code}`} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard tone="blue" label="Wings" value={s.stats.wings} sub="Blocks / towers" />
        <StatCard tone="lilac" label="Flats" value={s.stats.units} sub={`${s.stats.occupied_units} occupied`} href="/society/units" />
        <StatCard tone="green" label="Residents" value={s.stats.active_residents} sub="Approved" href="/society/residents" />
        <StatCard tone="yellow" label="Pending" value={s.stats.pending_residents} sub="Waiting for approval" href="/society/approvals" />
        <StatCard tone="peach" label="Status" value={s.status === "active" ? "Active" : s.status} sub={s.status === "active" ? "Live on Odeslo" : "Contact Odeslo"} />
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <LocationCard key={`${s.lat},${s.lng}`} society={s} canEdit={canEdit} />
          <DetailsCard key={s.id + s.name + s.address + s.pincode} society={s} canEdit={canEdit} />
        </div>
        <div className="space-y-4">
          <JoinCodeCard societyId={s.id} code={s.code} />
        </div>
      </div>
    </>
  );
}
