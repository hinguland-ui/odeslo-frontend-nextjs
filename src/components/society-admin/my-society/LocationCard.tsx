"use client";

import { useState } from "react";
import { Button, Input, MapView, Panel, PanelTitle, type MapMarker } from "@/components/ui";
import { useAction } from "@/hooks/useAction";
import { useToast } from "@/components/providers/ToastProvider";
import { locationRequestsApi } from "@/lib/api/societies";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui";
import { currentPosition, geocodePincode, googleMapsUrl, reverseGeocode, searchPlaces, type Address, type Place } from "@/lib/maps/geocode";
import type { Society } from "@/lib/types/society";

const fmt = (n: number) => n.toFixed(5);

/** Where the society is on the map. Change it by dragging the pin, clicking the map, searching or using your location. */
export function LocationCard({ society, canEdit }: { society: Society; canEdit: boolean }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState({ lat: society.lat, lng: society.lng });
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number; key: number } | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);

  const [found, setFound] = useState<Address | null>(null);
  const [useAddress, setUseAddress] = useState(true);
  const [pinCode, setPinCode] = useState("");

  const [reason, setReason] = useState("");
  const requests = useQuery({ queryKey: ["location-requests"], queryFn: () => locationRequestsApi.list() });
  const pending = requests.data?.find((r) => r.status === "pending");
  const last = requests.data?.find((r) => r.status === "rejected" || r.status === "approved");

  // The pin is moved by the Odeslo team: this only SENDS the request.
  const send = useAction(
    () =>
      locationRequestsApi.create({
        lat: pin.lat,
        lng: pin.lng,
        reason: reason.trim() || undefined,
        ...(useAddress && found
          ? {
              ...(found.address && { address: found.address }),
              ...(found.area && { area: found.area }),
              ...(found.city && { city: found.city }),
              ...(found.state && { state: found.state }),
              ...(/^\d{6}$/.test(found.pincode) && { pincode: found.pincode }),
            }
          : {}),
      }),
    {
      invalidate: [["location-requests"]],
      success: "Request sent to the Odeslo team",
      onSuccess: () => { setEditing(false); setFound(null); setReason(""); setPin({ lat: society.lat, lng: society.lng }); },
    },
  );
  const withdraw = useAction((id: number) => locationRequestsApi.cancel(id), { invalidate: [["location-requests"]], success: "Request cancelled" });

  const moveTo = (lat: number, lng: number, fly = false) => {
    setPin({ lat, lng });
    if (fly) setFocus({ lat, lng, key: Date.now() });
    // read the address of the new spot so it can be applied together with the location
    reverseGeocode(lat, lng).then(setFound).catch(() => setFound(null));
  };

  const onPinCode = async (raw: string) => {
    const code = raw.replace(/\D/g, "").slice(0, 6);
    setPinCode(code);
    if (code.length !== 6) return;
    const spot = await geocodePincode(code).catch(() => null);
    if (spot) moveTo(spot.lat, spot.lng, true);
    else toast("This PIN code was not found on the map.", "error");
  };

  const search = async () => {
    if (q.trim().length < 3) return;
    setSearching(true);
    try {
      const r = await searchPlaces(q.trim());
      setResults(r);
      if (r.length === 0) toast("No place found. Try a landmark or area name.", "error");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Search failed", "error");
    } finally {
      setSearching(false);
    }
  };

  const useMine = async () => {
    try {
      const p = await currentPosition();
      moveTo(p.lat, p.lng, true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Location unavailable", "error");
    }
  };

  const cancel = () => {
    setPin({ lat: society.lat, lng: society.lng });
    setFocus({ lat: society.lat, lng: society.lng, key: Date.now() });
    setResults([]);
    setQ("");
    setFound(null);
    setPinCode("");
    setEditing(false);
  };

  const markers: MapMarker[] = [{ id: "society", lat: pin.lat, lng: pin.lng, label: society.name, selected: true, draggable: editing }];
  const moved = Math.abs(pin.lat - society.lat) > 1e-6 || Math.abs(pin.lng - society.lng) > 1e-6;

  return (
    <Panel>
      <PanelTitle
        aside={
          editing ? (
            <span className="font-semibold text-lilac-fg">Drag the pin or click on the map, then send the request</span>
          ) : (
            <a href={googleMapsUrl(society.lat, society.lng)} target="_blank" rel="noreferrer" className="font-semibold text-lilac-fg hover:underline">Open in Google Maps</a>
          )
        }
      >
        Location on map
      </PanelTitle>

      {editing && (
        <div className="mb-3 space-y-2">
          <Input value={pinCode} inputMode="numeric" maxLength={6} onChange={(e) => onPinCode(e.target.value)} placeholder="Type a PIN code to jump there" />
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); search(); }}>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search address, area or landmark" />
            <Button type="submit" variant="light" loading={searching} disabled={q.trim().length < 3} className="shrink-0">Search</Button>
            <Button type="button" variant="light" onClick={useMine} className="shrink-0">Use my location</Button>
          </form>
          {results.length > 0 && (
            <ul className="max-h-[150px] overflow-y-auto rounded-[14px] bg-mist scroll-thin">
              {results.map((r) => (
                <li key={`${r.lat},${r.lng}`}>
                  <button type="button" onClick={() => { moveTo(r.lat, r.lng, true); setResults([]); }} className="block w-full px-3 py-2 text-left text-[12px] leading-4 text-ink hover:bg-line">{r.label}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <MapView
        markers={markers}
        center={{ lat: society.lat, lng: society.lng }}
        zoom={16}
        focus={focus}
        height={editing ? 380 : 300}
        onMapClick={editing ? (lat, lng) => moveTo(lat, lng) : undefined}
        onMarkerDrag={(_, lat, lng) => moveTo(lat, lng)}
      />

      {pending && (
        <p className="mt-3 rounded-[14px] bg-yellow-bg px-3.5 py-2.5 text-[12px] leading-4 text-yellow-fg">
          <span className="font-bold">Waiting for the Odeslo team.</span> You asked to move the pin to {fmt(pending.new_lat)}, {fmt(pending.new_lng)}
          {pending.new_area ? ` (${pending.new_area})` : ""}. The map below keeps showing the current location until it is approved.
        </p>
      )}
      {!pending && !editing && last && (
        <p className={`mt-3 rounded-[14px] px-3.5 py-2.5 text-[12px] leading-4 ${last.status === "approved" ? "bg-green-bg text-green-fg" : "bg-pink-bg text-pink-fg"}`}>
          <span className="font-bold">{last.status === "approved" ? "Your last location change was approved." : "Your last location change was not approved."}</span>
          {last.decision_note ? ` ${last.decision_note}` : ""}
        </p>
      )}
      {editing && moved && (
        <div className="mt-3">
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why should the location change? (optional, helps the Odeslo team approve faster)" maxLength={500} />
        </div>
      )}
      {editing && found && moved && (found.address || found.area || found.city) && (
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-[14px] bg-green-bg px-3.5 py-2.5 text-[12px] leading-4 text-green-fg">
          <input type="checkbox" checked={useAddress} onChange={(e) => setUseAddress(e.target.checked)} className="mt-0.5 size-4 accent-green-fg" />
          <span>
            <span className="font-bold">Also ask to update the society address from this spot</span>
            <span className="block text-ink">{[found.address, found.area, found.city, found.state, found.pincode].filter(Boolean).join(", ")}</span>
          </span>
        </label>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] leading-4">
          <p className="font-semibold text-ink">{moved ? "Requested pin" : "Current location"}: {fmt(pin.lat)}, {fmt(pin.lng)}</p>
          <p className="text-muted">{society.address}, {society.area}, {society.city}</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="light" onClick={cancel}>Cancel</Button>
            <Button loading={send.isPending} disabled={!moved} onClick={() => send.mutate(undefined)}>Send request</Button>
          </div>
        ) : pending ? (
          <Button variant="light" loading={withdraw.isPending} onClick={() => withdraw.mutate(pending.id)}>Cancel request</Button>
        ) : canEdit ? (
          <Button variant="light" onClick={() => setEditing(true)}>Request location change</Button>
        ) : (
          <span className="text-[11px] text-muted">Only the primary admin can ask for this.</span>
        )}
      </div>
    </Panel>
  );
}
