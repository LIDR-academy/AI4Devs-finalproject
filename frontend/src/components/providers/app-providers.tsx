"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

import { OfflineBanner } from "@/components/providers/offline-banner";
import { useAuth } from "@/hooks/use-auth";

function SessionBootstrap() {
  const { hydrateSession } = useAuth();

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap />
      <OfflineBanner />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #e2e8f0",
            color: "#0f172a",
          },
          success: {
            style: {
              border: "1px solid #10b981",
              background: "#ecfdf5",
              color: "#065f46",
            },
          },
          error: {
            style: {
              border: "1px solid #f43f5e",
              background: "#fff1f2",
              color: "#9f1239",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
