import { api } from "@/lib/api/client";
import { PUBLIC_API_URL } from "@/lib/config";
import { isSignedIn } from "@/lib/auth/session";
import type { RealtimeEvent } from "@/lib/types/live";

export type LinkState = "off" | "connecting" | "live";

let state: LinkState = "off";
const listeners = new Set<() => void>();
const setState = (s: LinkState) => {
  if (state === s) return;
  state = s;
  listeners.forEach((l) => l());
};

export const linkStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

// a one-minute, one-use ticket, never the login token (browsers show socket URLs in the network tab)
const wsUrl = (ticket: string) => `${PUBLIC_API_URL.replace(/^http/, "ws")}/realtime/ws?ticket=${encodeURIComponent(ticket)}`;

/**
 * Keeps one WebSocket open for the logged-in user and reconnects with a growing delay.
 * `onEvent` receives every server event; `onReconnect` fires after a dropped link comes back (catch up on missed events).
 */
export function openRealtime(onEvent: (e: RealtimeEvent) => void, onReconnect: () => void): () => void {
  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let ping: ReturnType<typeof setInterval> | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let hadLink = false;

  const connect = async () => {
    if (closed || !isSignedIn()) return setState("off");
    setState("connecting");
    let ticket: string;
    try {
      ticket = (await api.post<{ ticket: string }>("/auth/ws-ticket")).ticket;
    } catch {
      setState("off");
      if (!closed) retry = setTimeout(connect, Math.min(15_000, 1000 * 2 ** attempt++));
      return;
    }
    if (closed) return;
    socket = new WebSocket(wsUrl(ticket));
    socket.onopen = () => {
      attempt = 0;
      ping = setInterval(() => socket?.readyState === WebSocket.OPEN && socket.send("ping"), 25_000);
    };
    socket.onmessage = (m) => {
      if (m.data === "pong") return;
      try {
        const e = JSON.parse(m.data as string) as RealtimeEvent;
        if (e.type === "ready") {
          setState("live");
          if (hadLink) onReconnect();
          hadLink = true;
        }
        onEvent(e);
      } catch {
        /* ignore malformed frames */
      }
    };
    socket.onclose = (ev) => {
      clearInterval(ping);
      setState("off");
      if (closed || ev.code === 4401) return; // 4401: token no longer valid, the next API call logs out
      retry = setTimeout(connect, Math.min(15_000, 1000 * 2 ** attempt++));
    };
    socket.onerror = () => socket?.close();
  };

  connect();
  const onVisible = () => {
    if (document.visibilityState === "visible" && !closed && (!socket || socket.readyState > 1)) {
      clearTimeout(retry);
      connect();
    }
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    closed = true;
    clearInterval(ping);
    clearTimeout(retry);
    document.removeEventListener("visibilitychange", onVisible);
    socket?.close();
    setState("off");
  };
}
