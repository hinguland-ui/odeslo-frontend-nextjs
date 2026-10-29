/**
 * MapLibre GL JS (vector maps, smooth zoom / tilt) is loaded on first use.
 * Map data comes from OpenFreeMap (OpenStreetMap based): free, no API key, usable commercially.
 * Only the small part of the API we use is typed here.
 */
export type LngLatLike = [number, number];
export interface LngLat { lng: number; lat: number }
export interface MapMouseEvent { lngLat: LngLat }

export interface GeoJSONSource { setData(data: unknown): void }
export interface MLMap {
  addControl(control: unknown, position?: string): MLMap;
  on(event: string, fn: (e: MapMouseEvent) => void): MLMap;
  once(event: string, fn: () => void): MLMap;
  flyTo(o: Record<string, unknown>): MLMap;
  easeTo(o: Record<string, unknown>): MLMap;
  fitBounds(bounds: [LngLatLike, LngLatLike], o?: Record<string, unknown>): MLMap;
  jumpTo(o: Record<string, unknown>): MLMap;
  resize(): MLMap;
  remove(): void;
  isStyleLoaded(): boolean;
  getSource(id: string): GeoJSONSource | undefined;
  addSource(id: string, source: Record<string, unknown>): MLMap;
  addLayer(layer: Record<string, unknown>): MLMap;
  getLayer(id: string): unknown;
  getCanvas(): HTMLCanvasElement;
}
export interface MLMarker {
  setLngLat(ll: LngLatLike): MLMarker;
  getLngLat(): LngLat;
  addTo(map: MLMap): MLMarker;
  on(event: string, fn: () => void): MLMarker;
  remove(): MLMarker;
  setDraggable(v: boolean): MLMarker;
}
export interface MapLibreNS {
  Map: new (o: Record<string, unknown>) => MLMap;
  Marker: new (o?: Record<string, unknown>) => MLMarker;
  NavigationControl: new (o?: Record<string, unknown>) => unknown;
}

export const MAP_STYLES = {
  /** Detailed streets, buildings (3D when tilted), parks, water, place labels. */
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  /** Clean and colourful, good for pins on top. */
  bright: "https://tiles.openfreemap.org/styles/bright",
  /** Quiet grey base, lets markers stand out. */
  positron: "https://tiles.openfreemap.org/styles/positron",
  /** Dark base for the dark theme (CARTO Dark Matter, free with attribution). */
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;
export type MapStyleName = keyof typeof MAP_STYLES;

let pending: Promise<MapLibreNS> | null = null;

/** Bundled with the app (no CDN), so the map and its stylesheet always load together and the canvas is measured correctly. */
export function loadMapLibre(): Promise<MapLibreNS> {
  if (pending) return pending;
  pending = Promise.all([import("maplibre-gl"), import("maplibre-gl/dist/maplibre-gl.css")]).then(([m]) => {
    const ns = ((m as { default?: unknown }).default ?? m) as unknown as MapLibreNS & { setWorkerUrl?: (u: string) => void }; // v4 had a default export, v5+ only named ones
    // the worker file is served from /public/maplibre (see scripts/copy-map-worker.mjs): a bundled worker URL breaks on nested pages
    ns.setWorkerUrl?.(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);
    return ns;
  });
  pending.catch(() => (pending = null));
  return pending;
}
