import {
    defaultShouldDehydrateQuery,
    QueryClient,
  } from "@tanstack/react-query";
  import superjson from "superjson";
  
  export function makeQueryClient() {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10 * 1000, // Reduced to 10 seconds for faster initial loads
        },
        dehydrate: {
          serializeData: superjson.serialize,
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending",
        },
        hydrate: {
          deserializeData: superjson.deserialize,
        },
      },
    });
  }
  