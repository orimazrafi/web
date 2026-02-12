import type { Filters } from "../components/FiltersBar/types";

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

export async function fetchTimeseries(
  filters: Filters,
  opts?: FetchTimeseriesOptions
): Promise<TimeseriesPoint[]> {
  const coinId = resolveCoinId(filters as any);
  const fromSec = parseFromDate((filters as any).from);
  const toSec = parseToDate((filters as any).to);

  const vsCurrency = "usd";

  const url =
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart/range` +
    `?vs_currency=${vsCurrency}&from=${fromSec}&to=${toSec}`;

  const res = await fetch(url, { signal: opts?.signal });

  if (res.status === 429) {
    res.body?.cancel?.();
    throw new RateLimit429Error("CoinGecko rate limit (429) — try again in a minute");
  }
  if (!res.ok) throw new Error(`Crypto API failed (${res.status})`);

  // Support both flat and nested shapes the user described:
  // { prices: [[ts, price]], market_caps: [[ts, cap]], total_volume: [[ts, vol]] }
  // or { prices: { prices: [[ts, price]], market_caps: [[ts, cap]], total_volume: [[ts, vol]] } }
  const raw = await res.json();

  let pricePairs: [number, number][] | undefined;

  if (Array.isArray(raw?.prices)) {
    pricePairs = raw.prices as [number, number][];
  } else if (Array.isArray(raw?.prices?.prices)) {
    pricePairs = raw.prices.prices as [number, number][];
  }

  if (!pricePairs) {
    throw new Error("Unexpected crypto API response shape (missing prices array)");
  }

  return pricePairs.map(([ts, price]) => ({
    ts: new Date(ts).toISOString(),
    value: price,
  }));
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
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}?${COIN_DETAIL_PARAMS}`;

  const res = await fetch(url, { signal: opts?.signal });

  if (res.status === 429) {
    res.body?.cancel?.();
    throw new RateLimit429Error("CoinGecko rate limit (429) — try again in a minute");
  }
  if (!res.ok) throw new Error(`Crypto API failed (${res.status})`);

  const raw = await res.json();
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
