"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, CellTitle, ChipGroup, DataTable, EmptyState, PageHeader, Panel, StatusBadge, type Column } from "@/components/ui";
import { BookingDetail } from "@/components/resident/BookingDetail";
import { residentApi } from "@/lib/api/resident";
import type { Booking } from "@/lib/types/deal";
import { categoryOf } from "@/lib/utils/categories";
import { fullDate, inr } from "@/lib/utils/format";

type Tab = "active" | "completed" | "cancelled";

export default function ResidentBookingsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const bookings = useQuery({ queryKey: ["resident", "bookings", tab], queryFn: () => residentApi.bookings(tab) });

  const list = bookings.data?.items ?? [];
  const selected = list.find((b) => b.id === selectedId) ?? list[0];

  const columns: Column<Booking>[] = [
    { key: "d", header: "Service", width: "1.6fr", render: (b) => <CellTitle title={b.deal_title ?? "Group deal"} sub={`${b.booking_no} · ${categoryOf(b.deal_category).label}`} /> },
    { key: "s", header: "Service date", width: "1fr", render: (b) => fullDate(b.service_date) },
    { key: "u", header: "Units", width: "0.5fr", render: (b) => b.units_count },
    { key: "a", header: "Amount", width: "0.8fr", render: (b) => <span className="font-semibold">{inr(b.amount)}</span> },
    { key: "st", header: "Status", width: "0.9fr", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader title="My bookings," light={`${list.length} ${tab}.`} actions={<Button href="/resident/services">Book a service</Button>} />
      <ChipGroup
        className="mb-4"
        value={tab}
        onChange={(v) => {
          setTab(v);
          setSelectedId(null);
        }}
        options={[
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DataTable
          columns={columns}
          rows={list}
          rowKey={(b) => b.id}
          loading={bookings.isLoading}
          rowHeight={55}
          onRowClick={(b) => setSelectedId(b.id)}
          selectedKey={selected?.id}
          className="min-h-[480px]"
          empty={<EmptyState title={`No ${tab} bookings`} action={<Button size="sm" href="/resident/services">Browse group deals</Button>} />}
        />
        {selected ? <BookingDetail key={selected.id} bookingId={selected.id} /> : <Panel variant="soft"><EmptyState title="Select a booking" /></Panel>}
      </div>
    </>
  );
}
