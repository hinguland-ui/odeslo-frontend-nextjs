"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageLoader } from "@/components/ui/Preloader";
import { Badge, EmptyState, KeyValue, MapView, PageHeader, Panel, PanelTitle, StatCard } from "@/components/ui";
import { googleMapsUrl } from "@/lib/maps/geocode";
import { PlaceCard } from "@/components/society-admin/worship/PlaceCard";
import { residentApi } from "@/lib/api/resident";
import { worshipApi } from "@/lib/api/worship";
import { categoryOf } from "@/lib/utils/categories";
import { fullDate, initials, titleCase } from "@/lib/utils/format";

const FEATURES: Record<string, string> = {
  group_deals: "Group deals",
  maintenance: "Maintenance",
  complaints: "Complaints",
  requests: "Requests",
  announcements: "Notices",
  masjid: "Masjid & namaz",
  staff: "Staff directory",
};

const call = (mobile: string) => (
  <a href={`tel:+91${mobile}`} className="text-[12px] font-semibold text-lilac-fg hover:underline">{mobile}</a>
);

export default function ResidentSocietyPage() {
  const home = useQuery({ queryKey: ["resident", "home"], queryFn: residentApi.home });
  const q = useQuery({ queryKey: ["resident", "society"], queryFn: residentApi.mySociety });
  const me = useQuery({ queryKey: ["resident", "me"], queryFn: residentApi.me });
  const places = useQuery({ queryKey: ["worship"], queryFn: () => worshipApi.list() });
  const s = q.data;
  const h = home.data;

  if (q.isLoading) return <PageLoader label="Loading your society" />;
  if (!s)
    return (
      <>
        <PageHeader title="My society," />
        <Panel variant="soft"><EmptyState title="Society details open after your request is approved" hint="Your society admin has not approved your flat yet." /></Panel>
      </>
    );

  const features = Object.entries(s.society.features).filter(([, on]) => on).map(([k]) => FEATURES[k] ?? titleCase(k));
  const vendorCats = Object.entries(s.vendors.by_category).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title={s.society.name} light="is your society." subtitle={`${s.society.area}, ${s.society.city}`} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard tone="blue" label="Flats" value={s.stats.units} sub={`${s.stats.wings} wings`} />
        <StatCard tone="green" label="Vendors" value={s.vendors.total} sub="Verified, serve your society" />
        <StatCard tone="yellow" label="Open deals" value={s.open_deals} sub="You can book now" href="/resident/services" />
        <StatCard tone="lilac" label="Staff" value={s.stats.staff} sub="Guards, housekeeping…" />
        <StatCard tone="peach" label="Society code" value={s.society.code} sub="Share with neighbours" />
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-blue-bg text-[18px] font-bold text-blue-fg">{initials(s.society.name)}</span>
              <div className="min-w-0">
                <p className="text-[17px] font-bold leading-[22px] text-ink">{s.society.name}</p>
                <p className="text-[12px] text-muted">{titleCase(s.society.type)} · {s.society.status === "active" ? "Active on Odeslo" : titleCase(s.society.status)}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <KeyValue label="Address" value={<span className="font-semibold">{s.society.address}</span>} />
              <KeyValue label="Area / City" value={`${s.society.area}, ${s.society.city}`} />
              <KeyValue label="State · PIN" value={`${s.society.state} · ${s.society.pincode}`} />
              {s.society.registration_number && <KeyValue label="Registration no." value={s.society.registration_number} />}
            </div>
          </Panel>

          {h && (
            <Panel>
              <PanelTitle aside={<a href={googleMapsUrl(h.society.lat, h.society.lng)} target="_blank" rel="noreferrer" className="font-semibold text-lilac-fg hover:underline">Open in Google Maps</a>}>Where is it</PanelTitle>
              <MapView markers={[{ id: "society", lat: h.society.lat, lng: h.society.lng, label: s.society.name, selected: true }]} center={{ lat: h.society.lat, lng: h.society.lng }} zoom={16} fit height={240} />
            </Panel>
          )}

          {!!places.data?.length && (
            <section>
              <PanelTitle aside={`${places.data.length}`}>Religious places</PanelTitle>
              <div className="space-y-3">
                {places.data.map((p) => <PlaceCard key={p.id} place={p} />)}
              </div>
            </section>
          )}

          <Panel>
            <PanelTitle aside={`${features.length} on`}>What you can do here</PanelTitle>
            <div className="flex flex-wrap gap-2">{features.map((f) => <Badge key={f} tone="green" dot={false}>{f}</Badge>)}</div>
          </Panel>

          <Panel>
            <PanelTitle aside={<Link href="/resident/services" className="font-semibold text-lilac-fg hover:underline">Browse deals</Link>}>Vendors serving your society</PanelTitle>
            {vendorCats.length ? (
              <div className="flex flex-wrap gap-2">
                {vendorCats.map(([c, n]) => <Badge key={c} tone={categoryOf(c).tone} dot={false}>{categoryOf(c).label} · {n}</Badge>)}
              </div>
            ) : <EmptyState title="No vendors assigned yet" />}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel variant="soft" as="aside" className="flex flex-col gap-2.5">
            <PanelTitle>Your flat</PanelTitle>
            <KeyValue label="Flat" value={h?.unit.label ?? "—"} />
            <KeyValue label="Unit type" value={titleCase(h?.unit.type)} />
            <KeyValue label="You are the" value={titleCase(me.data?.resident_type)} />
            <KeyValue label="Approved on" value={me.data?.approved_at ? fullDate(me.data.approved_at) : "—"} />
            <KeyValue label="Resident since" value={fullDate(me.data?.created_at)} />
          </Panel>

          <Panel variant="soft" as="aside">
            <PanelTitle>Committee</PanelTitle>
            {s.committee.length ? (
              <ul className="space-y-2">
                {s.committee.map((c) => (
                  <li key={c.name + c.mobile} className="rounded-[14px] bg-white px-3.5 py-3">
                    <p className="text-[13px] font-bold text-ink">{c.name} <span className="font-normal text-muted">· {titleCase(c.designation)}</span></p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-[12px]">
                      {c.mobile && call(c.mobile)}
                      {c.email && <a href={`mailto:${c.email}`} className="text-body hover:underline">{c.email}</a>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No committee members listed" />}
          </Panel>

          <Panel variant="soft" as="aside">
            <PanelTitle aside={`${s.staff.length}`}>Society staff</PanelTitle>
            {s.staff.length ? (
              <ul className="space-y-2">
                {s.staff.map((m) => (
                  <li key={m.mobile} className="flex items-center justify-between rounded-[14px] bg-white px-3.5 py-2.5">
                    <div><p className="text-[13px] font-semibold text-ink">{m.name}</p><p className="text-[11px] text-muted">{titleCase(m.type)}</p></div>
                    {call(m.mobile)}
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No staff added yet" />}
          </Panel>
        </div>
      </div>
    </>
  );
}
