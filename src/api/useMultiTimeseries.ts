import { useQuery } from "@tanstack/react-query";
import { fetchTimeseriesByCoin, RateLimit429Error } from "./client";

const ANALYTICS_COINS = ["bitcoin", "ethereum", "solana"] as const;

export type CoinId = (typeof ANALYTICS_COINS)[number];

export type MultiTimeseriesResult = Record<string, { ts: string; value: number }[]>;

async function fetchAll(
  from: string,
  to: string,
  signal?: AbortSignal
): Promise<MultiTimeseriesResult> {
  const controller = new AbortController();
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const entries = await Promise.all(
      ANALYTICS_COINS.map(async (coinId) => {
        const series = await fetchTimeseriesByCoin(coinId, from, to, {
          signal: controller.signal,
        });
        return [coinId, series] as const;
      })
    );
    return Object.fromEntries(entries);
  } catch (err) {
    if (err instanceof RateLimit429Error) {
      controller.abort();
    }
    throw err;
  }
}

export function useMultiTimeseries(from: string, to: string) {
  return useQuery({
    queryKey: ["multiTimeseries", from, to],
    queryFn: ({ signal }) => fetchAll(from, to, signal),
    enabled: !!from && !!to,
    retry: (failureCount, error) =>
      error instanceof RateLimit429Error ? false : failureCount < 3,
    retryDelay: (_failureCount, error) =>
      error instanceof RateLimit429Error ? 0 : 1000,
  });
}

export { ANALYTICS_COINS };
