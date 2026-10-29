"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import { Field, Input } from "./Field";
import { MapView } from "./MapView";
import { useToast } from "@/components/providers/ToastProvider";
import { currentPosition, geocodePincode, lookupPincode, reverseGeocode, searchPlaces, type Address, type Place } from "@/lib/maps/geocode";
import { Check } from "lucide-react";

export interface AddressValue extends Address {
  lat: number | null;
  lng: number | null;
}

/**
 * Address by map: type the PIN code and the city, state and areas of that PIN appear and the map jumps there.
 * Tap the map, drag the pin, search a place or use your location, and the street, area, city, state and PIN are
 * filled from that spot. Latitude and longitude are never typed: they come from the pin.
 */
export function AddressPicker({ value, onChange, mapHeight = 300 }: { value: AddressValue; onChange: (patch: Partial<AddressValue>) => void; mapHeight?: number }) {
  const toast = useToast();
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number; key: number } | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [pinNote, setPinNote] = useState("");

  const seq = useRef(0);
  const fly = (lat: number, lng: number, zoom = 16) => setFocus({ lat, lng, zoom, key: ++seq.current });

  /** A spot was chosen on the map: remember it and read the address of that spot. */
  const dropPin = async (lat: number, lng: number, moveMap = false) => {
    onChange({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    if (moveMap) fly(lat, lng);
    setBusy("address");
    try {
      const a = await reverseGeocode(lat, lng);
      if (a) {
        // keep what the person already typed when the map has nothing better
        onChange({ address: a.address || value.address, area: a.area || value.area, city: a.city || value.city, state: a.state || value.state, pincode: a.pincode || value.pincode });
        if (a.pincode) setPinNote("");
      } else toast("No address found at this spot. Fill it in by hand.", "info");
    } catch {
      toast("Could not read the address of this spot.", "error");
    } finally {
      setBusy("");
    }
  };

  /** PIN typed by the person: fill city / state, offer the areas, and move the map there. */
  const onPin = async (raw: string) => {
    const pin = raw.replace(/\D/g, "").slice(0, 6);
    onChange({ pincode: pin });
    setPinNote("");
    if (pin.length !== 6) return setAreas([]);
    setBusy("pin");
    try {
      const [info, spot] = await Promise.all([lookupPincode(pin), geocodePincode(pin)]);
      if (!info && !spot) {
        setAreas([]);
        return setPinNote("This PIN code was not found. Check it, or pick the spot on the map.");
      }
      if (info) {
        setAreas(info.areas);
        onChange({ city: info.city, state: info.state, area: info.areas.includes(value.area) ? value.area : info.areas[0] ?? "" });
      }
      if (spot) {
        onChange({ lat: Number(spot.lat.toFixed(6)), lng: Number(spot.lng.toFixed(6)) });
        fly(spot.lat, spot.lng, 14);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "PIN code lookup failed", "error");
    } finally {
      setBusy("");
    }
  };

  const search = async () => {
    if (q.trim().length < 3) return;
    setBusy("search");
    try {
      const r = await searchPlaces(q.trim());
      setResults(r);
      if (!r.length) toast("No place found. Try a landmark or area name.", "info");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Search failed", "error");
    } finally {
      setBusy("");
    }
  };

  const useMine = async () => {
    setBusy("gps");
    try {
      const p = await currentPosition();
      await dropPin(p.lat, p.lng, true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Location unavailable", "error");
    } finally {
      setBusy("");
    }
  };

  const pinned = value.lat != null && value.lng != null;

  return (
    <div className="col-span-2 space-y-3">
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
        <Field label="PIN code" hint={busy === "pin" ? "Finding the area…" : pinNote || "Type the 6-digit PIN: city, state and areas fill in, and the map moves there."}>
          <Input value={value.pincode} inputMode="numeric" maxLength={6} onChange={(e) => onPin(e.target.value)} placeholder="344001" />
        </Field>
        <Field label="Find a place on the map">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); search(); }}>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Landmark, road or area" />
            <Button type="submit" variant="light" loading={busy === "search"} disabled={q.trim().length < 3} className="shrink-0">Find</Button>
          </form>
        </Field>
      </div>

      {results.length > 0 && (
        <ul className="max-h-[140px] overflow-y-auto rounded-[14px] bg-mist scroll-thin">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button type="button" onClick={() => { setResults([]); dropPin(r.lat, r.lng, true); }} className="block w-full px-3 py-2 text-left text-[12px] leading-4 text-ink hover:bg-line">{r.label}</button>
            </li>
          ))}
        </ul>
      )}

      <MapView
        markers={pinned ? [{ id: "society", lat: value.lat!, lng: value.lng!, selected: true, draggable: true, label: value.area || "Your society" }] : []}
        center={pinned ? { lat: value.lat!, lng: value.lng! } : undefined}
        zoom={5}
        focus={focus}
        pitch={0}
        height={mapHeight}
        onMapClick={(lat, lng) => dropPin(lat, lng)}
        onMarkerDrag={(_, lat, lng) => dropPin(lat, lng)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] leading-4 text-body">
          {pinned ? <><span className="inline-flex items-center gap-1 font-bold text-green-fg"><Check size={14} strokeWidth={3} /> Pinned</span> {busy === "address" ? "· reading the address…" : "· drag the pin or tap another spot to change it"}</> : "Tap your society on the map, or enter the PIN code above. The address fills in by itself."}
        </p>
        <Button size="sm" variant="light" loading={busy === "gps"} onClick={useMine}>Use my location</Button>
      </div>

      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
        <Field label="Address" className="col-span-2"><Input value={value.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="Plot, street" /></Field>
        <Field label="Area">
          <Input value={value.area} onChange={(e) => onChange({ area: e.target.value })} placeholder="Locality" list="od-areas" />
          <datalist id="od-areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
        </Field>
        <Field label="City / district"><Input value={value.city} onChange={(e) => onChange({ city: e.target.value })} /></Field>
        <Field label="State" className="col-span-2"><Input value={value.state} onChange={(e) => onChange({ state: e.target.value })} /></Field>
      </div>
      {areas.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted">Areas in this PIN:</span>
          {areas.slice(0, 12).map((a) => (
            <button key={a} type="button" onClick={() => onChange({ area: a })} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${value.area === a ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line"}`}>{a}</button>
          ))}
        </div>
      )}
    </div>
  );
}
