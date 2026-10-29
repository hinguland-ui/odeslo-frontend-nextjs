"use client";

import { Badge, KeyValue, MapView, Panel, PanelTitle } from "@/components/ui";
import { googleMapsUrl } from "@/lib/maps/geocode";
import type { SocietyAdmin, SocietyDetail } from "@/lib/types/society";
import { fullDate, titleCase } from "@/lib/utils/format";

/** Profile, location on the map, committee and enabled features of one society. */
export function SocietyOverview({ society: s, admins }: { society: SocietyDetail; admins: SocietyAdmin[] }) {
  const features = Object.entries(s.features ?? {});
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Panel>
        <PanelTitle>Society profile</PanelTitle>
        <div className="space-y-2.5">
          <KeyValue label="Name" value={s.name} />
          <KeyValue label="Code" value={s.code} />
          <KeyValue label="Type" value={titleCase(s.type)} />
          <KeyValue label="Address" value={<span className="font-semibold">{s.address}</span>} />
          <KeyValue label="Area / City" value={`${s.area}, ${s.city}`} />
          <KeyValue label="State · PIN" value={`${s.state} · ${s.pincode}`} />
          <KeyValue label="Registration no." value={s.registration_number ?? "—"} />
          <KeyValue label="Documents required" value={s.require_documents ? "Yes" : "No"} />
          <KeyValue label="Onboarded" value={fullDate(s.created_at)} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle aside={<a className="font-semibold text-lilac-fg hover:underline" href={googleMapsUrl(s.lat, s.lng)} target="_blank" rel="noreferrer">Open in Google Maps</a>}>Location</PanelTitle>
        <MapView markers={[{ id: s.id, lat: s.lat, lng: s.lng, label: s.name, selected: true }]} center={{ lat: s.lat, lng: s.lng }} zoom={16} fit height={250} />
        <p className="mt-2 text-[11px] text-muted">{s.lat.toFixed(5)}, {s.lng.toFixed(5)}. The society admin can move this pin from their My society page.</p>
      </Panel>

      <Panel>
        <PanelTitle aside={`${admins.length}`}>Committee / admins</PanelTitle>
        {admins.length === 0 ? <p className="text-[12px] text-muted">No admin yet. Add a billing admin from onboarding.</p> : (
          <ul className="space-y-2">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-[14px] bg-panel px-3.5 py-2.5">
                <div><p className="text-[13px] font-bold text-ink">{a.name} <span className="font-normal text-muted">· {titleCase(a.designation)}</span></p><p className="text-[11px] text-muted">+91 {a.mobile} · {a.email}</p></div>
                <div className="flex gap-1.5"><Badge tone={a.role === "primary" ? "lilac" : "gray"} size="sm" dot={false}>{titleCase(a.role)}</Badge><Badge tone={a.status === "active" ? "green" : "pink"} size="sm" dot={false}>{titleCase(a.status)}</Badge></div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle aside={`${features.filter(([, on]) => on).length} on`}>Features</PanelTitle>
        <div className="flex flex-wrap gap-2">{features.map(([k, on]) => <Badge key={k} tone={on ? "green" : "gray"} dot={false}>{titleCase(k)}</Badge>)}</div>
      </Panel>
    </div>
  );
}
