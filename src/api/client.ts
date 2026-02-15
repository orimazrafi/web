import type { Filters } from "../components/FiltersBar/types";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const DEFAULT_BACKEND_URL = "http://localhost:3001";

/**
 * In dev: use backend by default (localhost:3001) so all APIs go through the Node server.
 * Override with VITE_API_URL in .env (set to "" to call CoinGecko directly in dev).
 * In production: use backend only when VITE_API_URL is set; else CoinGecko.
 */
const envUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
const API_BASE =
  (envUrl && String(envUrl).trim() !== "" ? String(envUrl).trim() : null) ||
  (typeof import.meta !== "undefined" && import.meta.env?.DEV ? DEFAULT_BACKEND_URL : null) ||
  COINGECKO_API_BASE;

const USE_BACKEND = API_BASE !== COINGECKO_API_BASE;

const HTTP_TOO_MANY_REQUESTS = 429;

export type TimeseriesPoint = { ts: string; value: number };

/** Thrown when API returns 429; treated as aborted so the request stops without using the response. */
export class RateLimit429Error extends DOMException {
  constructor(message: string = "Rate limit (429)") {
    super(message, "AbortError");
  }
}

function parseToUnixSeconds(dateStr: string): number {
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);

  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) throw new Error(`Invalid date: ${dateStr}`);
  const mm = Number(m[1]);
  const dd = Number(m[2]);
  const yyyy = Number(m[3]);
  return Math.floor(new Date(yyyy, mm - 1, dd).getTime() / 1000);
}

/** Start of day (00:00:00) in Unix seconds. */
function parseFromDate(dateStr: string): number {
  return parseToUnixSeconds(dateStr);
}

/** End of day (23:59:59) in Unix seconds so "today" and "yesterday" request a full day. */
function parseToDate(dateStr: string): number {
  const start = parseToUnixSeconds(dateStr);
  return start + 86400 - 1;
}

function resolveCoinId(filters: any): string {
  // אם יש לך filters.asset / filters.coin / וכו' – תעדכן פה.
  // CoinGecko IDs לדוגמה: "bitcoin", "ethereum", "solana"
  return filters.asset ?? "bitcoin";
}

export type FetchTimeseriesOptions = { signal?: AbortSignal };

export type MultiTimeseriesResult = Record<string, TimeseriesPoint[]>;

const ANALYTICS_COINS = ["bitcoin", "ethereum", "solana"] as const;

/** Multi-coin timeseries in one call when using backend; otherwise three parallel calls. */
export async function fetchMultiTimeseries(
  from: string,
  to: string,
  opts?: FetchTimeseriesOptions
): Promise<MultiTimeseriesResult> {
  if (USE_BACKEND) {
    const url = `${API_BASE}/api/multi-timeseries?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url, { signal: opts?.signal });
    if (res.status === HTTP_TOO_MANY_REQUESTS) {
      res.body?.cancel?.();
      throw new RateLimit429Error("Rate limit (429) — try again in a minute");
    }
    if (!res.ok) throw new Error(`Crypto API failed (${res.status})`);
    return res.json() as Promise<MultiTimeseriesResult>;
  }
  const entries = await Promise.all(
    ANALYTICS_COINS.map(async (coinId) => {
      const series = await fetchTimeseriesByCoin(coinId, from, to, opts);
      return [coinId, series] as const;
    })
  );
  return Object.fromEntries(entries);
}

/** Fetch price timeseries for one coin and date range (for analytics multi-asset). */
export async function fetchTimeseriesByCoin(
  coinId: string,
  from: string,
  to: string,
  opts?: FetchTimeseriesOptions
): Promise<TimeseriesPoint[]> {
  const url = USE_BACKEND
    ? `${API_BASE}/api/coins/${encodeURIComponent(coinId)}/market-chart/range?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    : `${API_BASE}/coins/${encodeURIComponent(coinId)}/market_chart/range?vs_currency=usd&from=${parseFromDate(from)}&to=${parseToDate(to)}`;

  const res = await fetch(url, { signal: opts?.signal });

  if (res.status === HTTP_TOO_MANY_REQUESTS) {
    res.body?.cancel?.();
    throw new RateLimit429Error("Rate limit (429) — try again in a minute");
  }
  if (!res.ok) throw new Error(`Crypto API failed (${res.status})`);

  const raw = await res.json();
  if (USE_BACKEND && Array.isArray(raw)) {
    return raw as TimeseriesPoint[];
  }
  let pricePairs: [number, number][] | undefined;
  if (Array.isArray(raw?.prices)) {
    pricePairs = raw.prices as [number, number][];
  } else if (Array.isArray(raw?.prices?.prices)) {
    pricePairs = raw.prices.prices as [number, number][];
  }
  if (!pricePairs) throw new Error("Unexpected crypto API response shape (missing prices array)");

  return pricePairs.map(([ts, price]) => ({
    ts: new Date(ts).toISOString(),
    value: price,
  }));
}

export async function fetchTimeseries(
  filters: Filters,
  opts?: FetchTimeseriesOptions
): Promise<TimeseriesPoint[]> {
  return fetchTimeseriesByCoin(
    resolveCoinId(filters as Filters),
    (filters as Filters).from,
    (filters as Filters).to,
    opts
  );
}

// --- Coin detail (market data for KPIs) ---

export type CoinMarketData = {
  current_price_usd: number;
  market_cap_usd: number;
  total_volume_usd: number;
  market_cap_rank: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_percentage_24h: number | null;
};

const COIN_DETAIL_PARAMS =
  "localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

export async function fetchCoinMarketData(
  coinId: string,
  opts?: FetchTimeseriesOptions
): Promise<CoinMarketData> {
  const url = USE_BACKEND
    ? `${API_BASE}/api/coins/${encodeURIComponent(coinId)}`
    : `${COINGECKO_API_BASE}/coins/${encodeURIComponent(coinId)}?${COIN_DETAIL_PARAMS}`;

  const res = await fetch(url, { signal: opts?.signal });

  if (res.status === HTTP_TOO_MANY_REQUESTS) {
    res.body?.cancel?.();
    throw new RateLimit429Error("Rate limit (429) — try again in a minute");
  }
  if (!res.ok) throw new Error(`Crypto API failed (${res.status})`);

  const raw = await res.json();
  if (USE_BACKEND && raw?.current_price_usd !== undefined) {
    return raw as CoinMarketData;
  }
  const md = raw?.market_data;
  if (!md) throw new Error("Unexpected coin API response (missing market_data)");

  return {
    current_price_usd: md.current_price?.usd ?? 0,
    market_cap_usd: md.market_cap?.usd ?? 0,
    total_volume_usd: md.total_volume?.usd ?? 0,
    market_cap_rank: md.market_cap_rank ?? null,
    price_change_percentage_24h: md.price_change_percentage_24h ?? null,
    market_cap_change_percentage_24h: md.market_cap_change_percentage_24h ?? null,
  };
}
