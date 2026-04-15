import { QueryClient } from "@tanstack/react-query";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: ONE_DAY_MS,
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export { ONE_DAY_MS };
