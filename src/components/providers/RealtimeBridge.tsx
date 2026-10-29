"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { isSignedIn } from "@/lib/auth/session";
import { openRealtime } from "@/lib/realtime/socket";

/**
 * Turns server events into fresh screens: a notification shows a toast and refetches what is on screen,
 * "refresh" (someone changed data in your society) refetches, chat and live location refetch only their own query.
 */
export function RealtimeBridge() {
  const qc = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    if (!isSignedIn()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // many events can arrive together; refetch everything on screen once
    const refreshSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => qc.invalidateQueries({ predicate: (q) => !["chat", "job-location"].includes(String(q.queryKey[0])) }), 700);
    };

    const stop = openRealtime(
      (e) => {
        if (e.type === "refresh") refreshSoon();
        else if (e.type === "notification") {
          toast(e.body ? `${e.title}: ${e.body}` : e.title, "info");
          refreshSoon();
        } else if (e.type === "chat") {
          const open = qc.getQueryCache().find({ queryKey: ["chat", e.job_id] })?.getObserversCount() ?? 0;
          if (!open) toast("New message on a service job", "info");
          qc.invalidateQueries({ queryKey: ["chat", e.job_id] });
        } else if (e.type === "job_location") {
          qc.invalidateQueries({ queryKey: ["job-location", e.job_id] });
        }
      },
      () => qc.invalidateQueries(), // reconnected: catch up on everything missed
    );
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [qc, toast]);

  return null;
}
