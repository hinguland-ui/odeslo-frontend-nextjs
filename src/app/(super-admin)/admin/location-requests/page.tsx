"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, Chip, EmptyState, ErrorState, MapView, PageHeader, Panel, ReasonModal, Skeleton } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { googleMapsUrl } from "@/lib/maps/geocode";
import { locationRequestsApi, type LocationRequest } from "@/lib/api/societies";
import { ago, fullDate } from "@/lib/utils/format";

type Filter = "pending" | "approved" | "rejected" | "all";
const TONE = { pending: "yellow", approved: "green", rejected: "pink", cancelled: "gray" } as const;

function kmBetween(a: LocationRequest) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(a.new_lat - a.old_lat);
  const dLng = rad(a.new_lng - a.old_lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.old_lat)) * Math.cos(rad(a.new_lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const dist = (a: LocationRequest) => {
  const d = kmBetween(a);
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

function RequestCard({ r, onApprove, onReject, busy }: { r: LocationRequest; onApprove: () => void; onReject: () => void; busy: boolean }) {
  const newAddr = [r.new_address, r.new_area, r.new_city, r.new_state, r.new_pincode].filter(Boolean).join(", ");
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-ink">{r.society_name} <span className="text-[12px] font-semibold text-muted">{r.society_code}</span></h3>
          <p className="text-[12px] text-muted">Asked {ago(r.created_at)} · {fullDate(r.created_at)}</p>
        </div>
        <Badge tone={TONE[r.status]} dot={false}>{r.status[0]!.toUpperCase() + r.status.slice(1)}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <MapView
          height={230}
          fit
          markers={[
            { id: "old", lat: r.old_lat, lng: r.old_lng, label: "Now", tone: "ink" },
            { id: "new", lat: r.new_lat, lng: r.new_lng, label: "Requested", selected: true },
          ]}
        />
        <div className="space-y-2 text-[12px] leading-4">
          <p className="rounded-[14px] bg-mist px-3 py-2.5">
            <span className="font-bold text-ink">Moves by {dist(r)}</span><br />
            <span className="text-muted">Now: {r.old_lat.toFixed(5)}, {r.old_lng.toFixed(5)}</span><br />
            <span className="text-muted">Requested: {r.new_lat.toFixed(5)}, {r.new_lng.toFixed(5)}</span>
          </p>
          {r.old_address && <p><span className="font-semibold text-muted">Current address</span><br />{r.old_address}</p>}
          {newAddr ? <p><span className="font-semibold text-muted">Address will become</span><br />{newAddr}</p> : <p className="text-muted">Only the pin moves; the address stays as it is.</p>}
          {r.reason && <p className="rounded-[14px] bg-lilac-bg px-3 py-2.5 text-lilac-fg"><span className="font-bold">Reason from the admin:</span> {r.reason}</p>}
          {r.decision_note && <p className="rounded-[14px] bg-panel px-3 py-2.5 text-body"><span className="font-bold">Note:</span> {r.decision_note}</p>}
          <p className="flex gap-3 font-semibold text-lilac-fg">
            <a href={googleMapsUrl(r.old_lat, r.old_lng)} target="_blank" rel="noreferrer" className="hover:underline">Current in Google Maps</a>
            <a href={googleMapsUrl(r.new_lat, r.new_lng)} target="_blank" rel="noreferrer" className="hover:underline">Requested in Google Maps</a>
          </p>
        </div>
      </div>

      {r.status === "pending" && (
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="danger" disabled={busy} onClick={onReject}>Reject</Button>
          <Button loading={busy} onClick={onApprove}>Approve and move the society</Button>
        </div>
      )}
    </Panel>
  );
}

export default function LocationRequestsPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [rejecting, setRejecting] = useState<LocationRequest | null>(null);
  const list = useQuery({ queryKey: ["location-requests", "all"], queryFn: () => locationRequestsApi.list() });
  const approve = useAction((id: number) => locationRequestsApi.approve(id), {
    invalidate: [["location-requests"], ["society"], ["societies"]],
    success: "Location updated. The society admin is told.",
  });
  const reject = useAction((v: { id: number; note: string }) => locationRequestsApi.reject(v.id, v.note), {
    invalidate: [["location-requests"]],
    success: "Request rejected",
    onSuccess: () => setRejecting(null),
  });

  const all = list.data ?? [];
  const rows = all.filter((r) => (filter === "all" ? true : r.status === filter));
  const count = (s: string) => all.filter((r) => r.status === s).length;

  return (
    <>
      <PageHeader
        title="Location requests,"
        light="societies asking to move their pin."
        actions={
          <>
            <Chip active={filter === "pending"} tone="yellow" onClick={() => setFilter("pending")}>Waiting · {count("pending")}</Chip>
            <Chip active={filter === "approved"} onClick={() => setFilter("approved")}>Approved</Chip>
            <Chip active={filter === "rejected"} onClick={() => setFilter("rejected")}>Rejected</Chip>
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
          </>
        }
      />
      {list.error && <ErrorState error={list.error} onRetry={() => list.refetch()} />}
      <div className="space-y-3">
        {list.isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-[320px] rounded-[24px]" />)}
        {!list.isLoading && rows.length === 0 && (
          <Panel><EmptyState title={filter === "pending" ? "No location requests waiting" : "Nothing here"} hint="A society admin sends one from My society, Location on map." /></Panel>
        )}
        {rows.map((r) => (
          <RequestCard key={r.id} r={r} busy={approve.isPending && approve.variables === r.id} onApprove={() => approve.mutate(r.id)} onReject={() => setRejecting(r)} />
        ))}
      </div>
      <ReasonModal
        open={!!rejecting}
        title={`Reject ${rejecting?.society_name ?? ""}'s request`}
        placeholder="Tell the admin why, so they can fix it and ask again"
        loading={reject.isPending}
        onClose={() => setRejecting(null)}
        onConfirm={(note) => rejecting && reject.mutate({ id: rejecting.id, note })}
      />
    </>
  );
}
