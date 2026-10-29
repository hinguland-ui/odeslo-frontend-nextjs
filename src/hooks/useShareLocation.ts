"use client";

import { useEffect, useRef, useState } from "react";
import { liveApi } from "@/lib/api/live";

export type ShareState = "off" | "starting" | "sharing" | "denied" | "unsupported" | "error";

const EVERY_MS = 8000;

/**
 * Vendor side: while `active`, watch this device's position and send it to the server every few seconds.
 * The browser tab has to stay open (phones may pause a background tab).
 */
export function useShareLocation(jobId: number, active: boolean) {
  const [state, setState] = useState<ShareState>("starting");
  const [sentAt, setSentAt] = useState<Date | null>(null);
  const last = useRef(0);

  useEffect(() => {
    if (!active || !("geolocation" in navigator)) return;
    const watch = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - last.current < EVERY_MS) return;
        last.current = now;
        try {
          await liveApi.share(jobId, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
          setSentAt(new Date());
          setState("sharing");
        } catch {
          setState("error");
        }
      },
      (err) => setState(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [jobId, active]);

  const unsupported = typeof navigator !== "undefined" && !("geolocation" in navigator);
  const shown: ShareState = !active ? "off" : unsupported ? "unsupported" : state;
  return { state: shown, sentAt };
}
