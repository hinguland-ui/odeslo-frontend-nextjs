"use client";

import { Preloader } from "./Preloader";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { loadMapLibre, MAP_STYLES, type MapLibreNS, type MapStyleName, type MLMap, type MLMarker } from "@/lib/maps/maplibre";

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  label?: string;
  /** Look of the marker: a pin (default), the live vendor, a home / destination, or "you are here". */
  kind?: "pin" | "vendor" | "home" | "me";
  tone?: "ink" | "violet" | "green" | "blue";
  /** Bigger violet pin with its name always visible. */
  selected?: boolean;
  draggable?: boolean;
}

interface MapViewProps {
  markers: MapMarker[];
  /** Initial centre when there are no markers. Default: India. */
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Fit all markers in view when the set of markers changes (browse maps). */
  fit?: boolean;
  /** Also re-fit every N ms, so a moving vendor and the destination always stay in view. */
  refitEveryMs?: number;
  /** Fly to this point whenever `key` changes (search result, "use my location"). */
  focus?: { lat: number; lng: number; zoom?: number; key: string | number } | null;
  /** A straight line between two points (vendor -> destination). */
  line?: { lat: number; lng: number }[] | null;
  /** Tilt in degrees: buildings rise in 3D when zoomed in. */
  pitch?: number;
  style?: MapStyleName;
  height?: number;
  onMarkerClick?: (id: string | number) => void;
  onMarkerDrag?: (id: string | number, lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

const COLOR = { ink: "#1c1c22", violet: "#7b6ef6", green: "#2f9e44", blue: "#3558c4" };
const CSS_ID = "odeslo-map-css";

const MAP_CSS = `
.od-m{position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;transform-origin:50% 100%;transition:transform .15s ease}
.od-m:hover{transform:scale(1.08)}
.od-pin{width:30px;height:38px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
.od-sel .od-pin{width:38px;height:48px}
.od-chip{margin-bottom:5px;max-width:170px;padding:4px 10px;border-radius:999px;background:var(--color-white);color:var(--color-ink);font:700 11px/14px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.od-dot{position:relative;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.od-dot::after{content:"";position:absolute;inset:-3px;border-radius:50%;background:inherit;opacity:.45;animation:od-pulse 1.8s ease-out infinite}
.od-vendor .od-dot{width:26px;height:26px;background:#2f9e44}
.od-me .od-dot{background:#3b82f6}
.od-home{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#3558c4;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.od-home svg{width:17px;height:17px}
@keyframes od-pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.6);opacity:0}}
.maplibregl-ctrl-group{border-radius:12px!important;box-shadow:0 2px 10px rgba(0,0,0,.15)!important;overflow:hidden}
.maplibregl-canvas{outline:none}
.dark .maplibregl-ctrl-group{background:var(--color-white)!important}
.dark .maplibregl-ctrl-group button+button{border-top:1px solid var(--color-line)!important}
.dark .maplibregl-ctrl-icon{filter:invert(1)}
.dark .maplibregl-ctrl-attrib{background:rgba(26,26,33,.8)!important;color:#c3c3cd!important}
.dark .maplibregl-ctrl-attrib a{color:#c3c3cd!important}
`;

const PIN_SVG = (color: string) =>
  `<svg class="od-pin" viewBox="0 0 30 38" aria-hidden="true"><path d="M15 1C7.8 1 2 6.7 2 13.8 2 23.6 15 37 15 37s13-13.4 13-23.2C28 6.7 22.2 1 15 1z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#fff"/></svg>`;
const HOME_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/></svg>`;

function buildElement(m: MapMarker, showChip: boolean, dark: boolean): HTMLElement {
  const kind = m.kind ?? (m.id === "me" ? "me" : m.id === "vendor" ? "vendor" : m.id === "home" ? "home" : "pin");
  const el = document.createElement("div");
  el.className = `od-m od-${kind}${m.selected ? " od-sel" : ""}`;
  const chip = m.label && (showChip || m.selected || kind !== "pin") ? `<div class="od-chip">${escapeHtml(m.label)}</div>` : "";
  const color = m.selected ? COLOR.violet : m.tone || !dark ? COLOR[m.tone ?? "ink"] : "#e9e9f0";
  const body = kind === "vendor" || kind === "me" ? `<div class="od-dot"></div>` : kind === "home" ? `<div class="od-home">${HOME_SVG}</div>` : PIN_SVG(color);
  el.innerHTML = chip + body;
  el.title = m.label ?? "";
  return el;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

interface Entry { marker: MLMarker; sig: string; raf?: number }

/**
 * Vector map (MapLibre GL + OpenFreeMap): smooth zoom and fly-to, 3D buildings when tilted, custom markers,
 * markers glide to their new position (live vendor), and a line between two points. No API key needed.
 */
function MapViewInner({
  markers, center, zoom = 5, fit, refitEveryMs, focus, line, pitch = 0, style = "liberty", height = 260,
  onMarkerClick, onMarkerDrag, onMapClick, className,
}: MapViewProps) {
  const dark = useTheme() === "dark";
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const libRef = useRef<MapLibreNS | null>(null);
  const entries = useRef(new Map<string | number, Entry>());
  const lastFitSig = useRef("");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState("");

  // latest props for the long-lived map callbacks
  const live = useRef({ onMarkerClick, onMarkerDrag, onMapClick, markers, fit });
  useEffect(() => {
    live.current = { onMarkerClick, onMarkerDrag, onMapClick, markers, fit };
  });

  // ---- create the map once
  useEffect(() => {
    let cancelled = false;
    loadMapLibre()
      .then((ml) => {
        if (cancelled || !box.current || mapRef.current) return;
        if (!document.getElementById(CSS_ID)) {
          const tag = document.createElement("style");
          tag.id = CSS_ID;
          tag.textContent = MAP_CSS;
          document.head.appendChild(tag);
        }
        const first = markers[0] ?? center ?? { lat: 22.5, lng: 79 };
        const map = new ml.Map({
          container: box.current,
          style: MAP_STYLES[dark ? "dark" : style],
          center: [first.lng, first.lat],
          zoom: markers.length || center ? Math.max(zoom, 13) : zoom,
          pitch,
          attributionControl: { compact: true },
          cooperativeGestures: true, // page scroll is not hijacked: Ctrl + scroll zooms
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl + scroll to zoom the map",
            "CooperativeGesturesHandler.MacHelpText": "Use ⌘ + scroll to zoom the map",
            "CooperativeGesturesHandler.MobileHelpText": "Use two fingers to move the map",
          },
        });
        map.addControl(new ml.NavigationControl({ visualizePitch: true }), "top-right");
        map.on("click", (e) => live.current.onMapClick?.(e.lngLat.lat, e.lngLat.lng));
        libRef.current = ml;
        mapRef.current = map;
        map.once("load", () => {
          map.resize();
          setReady(true);
        });
        // the box can still be settling (fonts, sidebars, modals): measure again a moment later
        [120, 500, 1500].forEach((ms) => setTimeout(() => mapRef.current?.resize(), ms));
        const ro = new ResizeObserver(() => map.resize());
        ro.observe(box.current);
        (map as unknown as { _od_ro: ResizeObserver })._od_ro = ro;
      })
      .catch((e: Error) => !cancelled && setFailed(e.message));
    const store = entries.current;
    return () => {
      cancelled = true;
      store.forEach((en) => en.raf && cancelAnimationFrame(en.raf));
      store.clear();
      const m = mapRef.current as unknown as { _od_ro?: ResizeObserver } | null;
      m?._od_ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // created once; the effects below keep it in sync with the props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- markers: add, update, glide, remove
  useEffect(() => {
    const ml = libRef.current;
    const map = mapRef.current;
    if (!ready || !ml || !map) return;
    const store = entries.current;
    const ids = new Set(markers.map((m) => m.id));

    store.forEach((en, id) => {
      if (!ids.has(id)) {
        en.raf && cancelAnimationFrame(en.raf);
        en.marker.remove();
        store.delete(id);
      }
    });

    // name chips on every pin only while the map is uncluttered; far-apart pins would hide behind each other
    const showChips = markers.length <= 1;
    markers.forEach((m) => {
      const sig = `${m.kind}|${m.tone}|${m.selected}|${m.label}|${m.draggable}|${showChips}|${dark}`;
      const found = store.get(m.id);
      if (found && found.sig === sig) {
        // same look: only the position may have changed -> glide there
        const from = found.marker.getLngLat();
        if (Math.abs(from.lat - m.lat) > 1e-7 || Math.abs(from.lng - m.lng) > 1e-7) glide(found, from, m);
        return;
      }
      found?.raf && cancelAnimationFrame(found.raf);
      found?.marker.remove();
      const el = buildElement(m, showChips, dark);
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        live.current.onMarkerClick?.(m.id);
      });
      const marker = new ml.Marker({ element: el, anchor: m.kind === "vendor" || m.kind === "me" || m.kind === "home" ? "center" : "bottom", draggable: !!m.draggable })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLngLat();
        live.current.onMarkerDrag?.(m.id, p.lat, p.lng);
      });
      store.set(m.id, { marker, sig });
    });

    // fit only when the set of markers changed (not on every vendor move)
    const sig = markers.map((m) => m.id).join(",");
    if (fit && sig !== lastFitSig.current && markers.length) {
      lastFitSig.current = sig;
      fitAll(map, markers);
    }

    function glide(en: Entry, from: { lng: number; lat: number }, to: MapMarker) {
      en.raf && cancelAnimationFrame(en.raf);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / 1000);
        const k = 1 - (1 - t) ** 3;
        en.marker.setLngLat([from.lng + (to.lng - from.lng) * k, from.lat + (to.lat - from.lat) * k]);
        if (t < 1) en.raf = requestAnimationFrame(step);
      };
      en.raf = requestAnimationFrame(step);
    }
  }, [markers, ready, fit, dark]);

  // ---- keep a moving vendor and the destination both in view
  useEffect(() => {
    if (!ready || !fit || !refitEveryMs) return;
    const t = setInterval(() => {
      const map = mapRef.current;
      if (map && live.current.markers.length > 1) fitAll(map, live.current.markers);
    }, refitEveryMs);
    return () => clearInterval(t);
  }, [ready, fit, refitEveryMs]);

  // ---- route line
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const data = { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: (line ?? []).map((p) => [p.lng, p.lat]) } };
    const src = map.getSource("od-route");
    if (src) src.setData(data);
    else if (line && line.length > 1) {
      map.addSource("od-route", { type: "geojson", data });
      map.addLayer({ id: "od-route-casing", type: "line", source: "od-route", paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.9 }, layout: { "line-cap": "round" } });
      map.addLayer({ id: "od-route", type: "line", source: "od-route", paint: { "line-color": COLOR.violet, "line-width": 4, "line-dasharray": [1.2, 1.6] }, layout: { "line-cap": "round" } });
    }
  }, [line, ready]);

  // ---- fly to a point on request
  useEffect(() => {
    if (ready && focus && mapRef.current) mapRef.current.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom ?? 16, duration: 1400, essential: true });
  }, [focus?.key, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={clsx("relative overflow-hidden rounded-[20px] border border-line bg-mist", className)} style={{ height }}>
      <div ref={box} className="z-0" style={{ position: "absolute", inset: 0 }} />
      {!ready && !failed && <div className="absolute inset-0 grid place-items-center bg-mist"><Preloader variant="spin" size={72} label="Loading map…" /></div>}
      {failed && <div className="absolute inset-0 grid place-items-center px-6 text-center text-[12px] text-pink-fg">{failed}</div>}
    </div>
  );
}

/** The base map is drawn once per theme, so the map is rebuilt when the theme changes. */
export function MapView(props: MapViewProps) {
  const theme = useTheme();
  return <MapViewInner key={theme} {...props} />;
}

function fitAll(map: MLMap, markers: MapMarker[]) {
  if (markers.length === 1) {
    map.flyTo({ center: [markers[0]!.lng, markers[0]!.lat], zoom: 15.5, duration: 900, essential: true });
    return;
  }
  const lngs = markers.map((m) => m.lng);
  const lats = markers.map((m) => m.lat);
  map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: { top: 80, bottom: 50, left: 70, right: 70 }, maxZoom: 16, duration: 900 });
}
