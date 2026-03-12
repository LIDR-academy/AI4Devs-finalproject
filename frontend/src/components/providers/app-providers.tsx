"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

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
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
