"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapView, Panel, PanelTitle, type MapMarker } from "@/components/ui";
import { liveApi } from "@/lib/api/live";
import { googleMapsUrl } from "@/lib/maps/geocode";

const ACTIVE = ["on_the_way", "started"];

const ago = (iso: string | null, now: number) => {
  if (!iso) return "";
  const s = Math.max(0, Math.round((now - new Date(iso.endsWith("Z") ? iso : `${iso}+05:30`).getTime()) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago`;
};

/** Live map: where the vendor is right now and how far from the society. Updates the moment the vendor's phone reports. */
export function TrackVendor({ jobId, jobStatus }: { jobId: number; jobStatus?: string | null }) {
  const enabled = !jobStatus || ACTIVE.includes(jobStatus);
  const q = useQuery({ queryKey: ["job-location", jobId], queryFn: () => liveApi.location(jobId), enabled, refetchInterval: 20_000, staleTime: 0 });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const loc = q.data;
  if (!enabled || !loc) return null;

  const markers: MapMarker[] = [];
  if (loc.destination) markers.push({ id: "home", kind: "home", lat: loc.destination.lat, lng: loc.destination.lng, label: loc.destination.label });
  if (loc.lat != null && loc.lng != null) markers.push({ id: "vendor", kind: "vendor", lat: loc.lat, lng: loc.lng, label: loc.eta_minutes ? `Vendor · ${loc.eta_minutes} min` : "Vendor" });
  const route = loc.sharing && loc.lat != null && loc.lng != null && loc.destination ? [{ lat: loc.lat, lng: loc.lng }, { lat: loc.destination.lat, lng: loc.destination.lng }] : null;

  const headline =
    loc.sharing && loc.job_status === "on_the_way" ? (loc.eta_minutes ? `On the way · about ${loc.eta_minutes} min away` : "On the way")
    : loc.sharing ? "Vendor is at the location"
    : "Waiting for the vendor's location";

  return (
    <Panel variant="soft" as="section">
      <PanelTitle aside={loc.sharing ? <span className="flex items-center gap-1.5 font-semibold text-green-fg"><span className="size-2 animate-pulse rounded-full bg-green-fg" />Live</span> : undefined}>Track your vendor</PanelTitle>
      <p className="mb-2 text-[13px] font-semibold text-ink">{headline}</p>
      {markers.length > 0 ? (
        <MapView markers={markers} line={route} fit refitEveryMs={15000} pitch={40} height={260} />
      ) : (
        <div className="grid h-[120px] place-items-center rounded-[16px] bg-white text-[12px] text-muted">The map appears once the vendor shares their location.</div>
      )}
      {loc.sharing && (
        <p className="mt-2 text-[11px] text-muted">
          {loc.distance_km != null ? `${loc.distance_km.toFixed(1)} km away · ` : ""}updated {ago(loc.updated_at, now)}
          {loc.lat != null && loc.lng != null && <> · <a className="font-semibold text-lilac-fg hover:underline" href={googleMapsUrl(loc.lat, loc.lng)} target="_blank" rel="noreferrer">Open in Google Maps</a></>}
        </p>
      )}
    </Panel>
  );
}
