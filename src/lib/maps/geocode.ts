/** Address search via OpenStreetMap Nominatim (free, light use only). */
export interface Place {
  label: string;
  lat: number;
  lng: number;
}

interface NominatimRow {
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchPlaces(q: string): Promise<Place[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Address search is not available right now.");
  const rows = (await res.json()) as NominatimRow[];
  return rows.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }));
}

export const googleMapsUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export function currentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Location is not available in this browser."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error("Could not read your location. Allow location access and try again.")),
      { timeout: 10000, enableHighAccuracy: true },
    );
  });
}

// ------------------------------------------------------------------ PIN code and pin-drop -> address

export interface Address {
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PinInfo {
  city: string;
  state: string;
  /** Post office / locality names for this PIN, to pick the area from. */
  areas: string[];
}

interface PostOffice { Name: string; District: string; State: string; Block?: string }

/** India Post: PIN code -> district (city), state and the localities of that PIN. */
export async function lookupPincode(pin: string): Promise<PinInfo | null> {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  if (!res.ok) throw new Error("PIN code lookup is not available right now.");
  const data = (await res.json()) as { Status: string; PostOffice: PostOffice[] | null }[];
  const offices = data[0]?.Status === "Success" ? data[0].PostOffice ?? [] : [];
  if (!offices.length) return null;
  return {
    city: offices[0]!.District,
    state: offices[0]!.State,
    areas: [...new Set(offices.map((o) => o.Name))],
  };
}

/** Where on the map a PIN code is. */
export async function geocodePincode(pin: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&postalcode=${pin}&country=India`, { headers: { Accept: "application/json", "Accept-Language": "en" } });
  if (!res.ok) return null;
  const rows = (await res.json()) as { lat: string; lon: string }[];
  return rows[0] ? { lat: Number(rows[0].lat), lng: Number(rows[0].lon) } : null;
}

interface NominatimAddress {
  house_number?: string; road?: string; neighbourhood?: string; suburb?: string; city_district?: string; village?: string;
  hamlet?: string; town?: string; city?: string; county?: string; state_district?: string; state?: string; postcode?: string;
}

/** A dropped pin -> street address, area, city, state and PIN (OpenStreetMap). Missing parts come back empty. */
export async function reverseGeocode(lat: number, lng: number): Promise<Address | null> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`, { headers: { Accept: "application/json", "Accept-Language": "en" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { address?: NominatimAddress; display_name?: string; error?: string };
  const a = data.address;
  if (!a) return null;
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const area = a.suburb ?? a.neighbourhood ?? a.city_district ?? a.village ?? a.hamlet ?? a.town ?? "";
  const city = a.city ?? a.town ?? a.state_district ?? a.county ?? a.village ?? "";
  // roads are missing in some places: fall back to the first parts of the full address
  const fallback = (data.display_name ?? "").split(",").slice(0, 2).join(",").trim();
  return {
    address: [street, a.neighbourhood && a.neighbourhood !== area ? a.neighbourhood : ""].filter(Boolean).join(", ") || fallback,
    area,
    city: city.replace(/ (Tehsil|District)$/i, ""),
    state: a.state ?? "",
    pincode: /^\d{6}$/.test(a.postcode ?? "") ? a.postcode! : "",
  };
}
