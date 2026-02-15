import { useQuery } from "@tanstack/react-query";
import { fetchMultiTimeseries, RateLimit429Error } from "./client";

const ANALYTICS_COINS = ["bitcoin", "ethereum", "solana"] as const;

export type CoinId = (typeof ANALYTICS_COINS)[number];

export type MultiTimeseriesResult = Record<string, { ts: string; value: number }[]>;

export function useMultiTimeseries(from: string, to: string) {
  return useQuery({
    queryKey: ["multiTimeseries", from, to],
    queryFn: ({ signal }) => fetchMultiTimeseries(from, to, { signal }),
    enabled: !!from && !!to,
    retry: (failureCount, error) =>
      error instanceof RateLimit429Error ? false : failureCount < 3,
    retryDelay: (_failureCount, error) =>
      error instanceof RateLimit429Error ? 0 : 1000,
  });
}

export { ANALYTICS_COINS };
