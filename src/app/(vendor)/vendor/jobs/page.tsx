"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChipGroup, EmptyState, PageHeader, Panel } from "@/components/ui";
import { JobDetail } from "@/components/vendor/jobs/JobDetail";
import { JobsTable } from "@/components/vendor/jobs/JobsTable";
import { vendorApi, type JobView } from "@/lib/api/vendor";

const VIEWS: { value: JobView; label: string; empty: string }[] = [
  { value: "today", label: "Today", empty: "No jobs scheduled for today" },
  { value: "upcoming", label: "Upcoming", empty: "No upcoming jobs" },
  { value: "active", label: "All active", empty: "No active jobs" },
  { value: "history", label: "History", empty: "No completed jobs yet" },
];

export default function VendorJobsPage() {
  const [view, setView] = useState<JobView>("today");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const jobs = useQuery({ queryKey: ["vendor", "jobs", view], queryFn: () => vendorApi.jobs(view), refetchInterval: 60_000 });

  const list = jobs.data ?? [];
  const selected = list.find((j) => j.id === selectedId) ?? list[0];

  return (
    <>
      <PageHeader title="My jobs," light={`${list.length} in this view.`} subtitle="Accept, travel, start and complete the work assigned to you." />
      <ChipGroup
        className="mb-4"
        value={view}
        onChange={(v) => {
          setView(v);
          setSelectedId(null);
        }}
        options={VIEWS.map((v) => ({ value: v.value, label: v.label }))}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <JobsTable
          jobs={jobs.data}
          loading={jobs.isLoading}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          emptyTitle={VIEWS.find((v) => v.value === view)!.empty}
        />
        {selected ? <JobDetail key={selected.id} jobId={selected.id} /> : <Panel variant="soft"><EmptyState title="Select a job" /></Panel>}
      </div>
    </>
  );
}
