"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTRPCClientConfig } from "@/src/lib/trpc/client";
import superjson from "superjson";

/**
 * Create a stable query client for React Query
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in admin panel
        refetchOnWindowFocus: false,
        // Stale time of 30 seconds
        staleTime: 30 * 1000,
        // Retry failed requests once
        retry: 1,
      },
    },
  });
}

// Browser-side query client singleton
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface TRPCProviderProps {
  children: React.ReactNode;
}

/**
 * tRPC Provider component
 * Wraps the app with QueryClientProvider and tRPC.Provider
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  const queryClient = getQueryClient();
  
  const [trpcClient] = useState(() =>
    trpc.createClient(createTRPCClientConfig())
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
