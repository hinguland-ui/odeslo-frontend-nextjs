"use client";

import clsx from "clsx";
import { useSyncExternalStore } from "react";
import { linkStore } from "@/lib/realtime/socket";

/** Small "Live" light in the sidebar: green when updates arrive instantly, grey while reconnecting. */
export function LiveDot() {
  const state = useSyncExternalStore(linkStore.subscribe, linkStore.get, () => "off" as const);
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted" title={state === "live" ? "Updates arrive instantly" : "Reconnecting…"}>
      <span className={clsx("size-2 rounded-full", state === "live" ? "animate-pulse bg-green-fg" : state === "connecting" ? "bg-yellow-fg" : "bg-line")} />
      {state === "live" ? "Live" : state === "connecting" ? "Connecting" : "Offline"}
    </span>
  );
}
