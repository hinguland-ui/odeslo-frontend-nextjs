import { api } from "./client";
import type { JobLocation, JobMessage } from "@/lib/types/live";

/** Chat and live location of a service job. Same calls for resident, vendor and society admin. */
export const liveApi = {
  messages: (jobId: number) => api.get<JobMessage[]>(`/service-jobs/${jobId}/messages`),
  send: (jobId: number, body: string) => api.post<JobMessage>(`/service-jobs/${jobId}/messages`, { body }),
  location: (jobId: number) => api.get<JobLocation>(`/service-jobs/${jobId}/location`),
  /** Vendor only: send my current position. */
  share: (jobId: number, lat: number, lng: number, accuracy?: number | null) =>
    api.post<JobLocation>(`/service-jobs/${jobId}/location`, { lat, lng, accuracy: accuracy ?? null }),
};
