import { useQuery } from "@tanstack/react-query";
import { fetchTimeseries, RateLimit429Error } from "./client";
import type { Filters } from "../components/FiltersBar/types";

const ONE_MINUTE_MS = 60_000;

export function useTimeseries(filters: Filters) {
  return useQuery({
    queryKey: ["timeseries", filters],
    queryFn: ({ signal }) => fetchTimeseries(filters, { signal }),
    placeholderData: prev => prev,
    // 429: retry once (2 attempts) then give up; other errors: retry 3 times (4 attempts)
    retry: (failureCount, error) =>
      error instanceof RateLimit429Error ? failureCount < 2 : failureCount < 3,
    retryDelay: (_failureCount, error) =>
      error instanceof RateLimit429Error ? ONE_MINUTE_MS : 1000,
  });
}
