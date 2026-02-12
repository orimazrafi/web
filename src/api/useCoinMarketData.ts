import { useQuery } from "@tanstack/react-query";
import { fetchCoinMarketData, RateLimit429Error } from "./client";

const ONE_MINUTE_MS = 60_000;

export function useCoinMarketData(coinId: string) {
  return useQuery({
    queryKey: ["coinMarketData", coinId],
    queryFn: ({ signal }) => fetchCoinMarketData(coinId, { signal }),
    enabled: !!coinId,
    retry: (failureCount, error) =>
      error instanceof RateLimit429Error ? failureCount < 2 : failureCount < 3,
    retryDelay: (_failureCount, error) =>
      error instanceof RateLimit429Error ? ONE_MINUTE_MS : 1000,
  });
}
