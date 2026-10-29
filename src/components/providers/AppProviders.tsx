"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { FilePreviewHost } from "./FilePreviewHost";
import { RealtimeBridge } from "./RealtimeBridge";
import { ToastProvider } from "./ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Seen once = kept. A screen you come back to shows its data at once (no spinner) and only refreshes
            // quietly when it is older than staleTime. Live changes still arrive through RealtimeBridge / invalidation.
            staleTime: 3 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: true,
            retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <RealtimeBridge />
        <FilePreviewHost />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
