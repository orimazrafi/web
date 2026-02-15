const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const HTTP_TOO_MANY_REQUESTS = 429;

function parseToUnixSeconds(dateStr: string): number {
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);
  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) throw new Error(`Invalid date: ${dateStr}`);
  const [_, mm, dd, yyyy] = m;
  return Math.floor(new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime() / 1000);
}

function parseFromDate(dateStr: string): number {
  return parseToUnixSeconds(dateStr);
}

function parseToDate(dateStr: string): number {
  return parseToUnixSeconds(dateStr) + 86400 - 1;
}

export type TimeseriesPoint = { ts: string; value: number };

export async function fetchTimeseriesByCoin(
  coinId: string,
  from: string,
  to: string
): Promise<TimeseriesPoint[]> {
  const fromSec = parseFromDate(from);
  const toSec = parseToDate(to);
  const url =
    `${COINGECKO_API_BASE}/coins/${encodeURIComponent(coinId)}/market_chart/range` +
    `?vs_currency=usd&from=${fromSec}&to=${toSec}`;

  const res = await fetch(url);

  if (res.status === HTTP_TOO_MANY_REQUESTS) {
    throw new Error("RATE_LIMIT_429");
  }
  if (!res.ok) {
    throw new Error(`CoinGecko API failed: ${res.status}`);
  }

  const raw = (await res.json()) as { prices?: [number, number][] | { prices?: [number, number][] } };
  let pricePairs: [number, number][] | undefined;
  if (Array.isArray(raw?.prices)) {
    pricePairs = raw.prices;
  } else if (raw?.prices && typeof raw.prices === "object" && Array.isArray((raw.prices as { prices?: [number, number][] }).prices)) {
    pricePairs = (raw.prices as { prices: [number, number][] }).prices;
  }
  if (!pricePairs) throw new Error("Unexpected API response: missing prices");

  return pricePairs.map(([ts, value]) => ({
    ts: new Date(ts).toISOString(),
    value,
  }));
}

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

export async function fetchCoinMarketData(coinId: string): Promise<CoinMarketData> {
  const url = `${COINGECKO_API_BASE}/coins/${encodeURIComponent(coinId)}?${COIN_DETAIL_PARAMS}`;
  const res = await fetch(url);

  if (res.status === HTTP_TOO_MANY_REQUESTS) {
    throw new Error("RATE_LIMIT_429");
  }
  if (!res.ok) {
    throw new Error(`CoinGecko API failed: ${res.status}`);
  }

  const raw = (await res.json()) as {
    market_data?: {
      current_price?: { usd?: number };
      market_cap?: { usd?: number };
      total_volume?: { usd?: number };
      market_cap_rank?: number | null;
      price_change_percentage_24h?: number | null;
      market_cap_change_percentage_24h?: number | null;
    };
  };
  const md = raw?.market_data;
  if (!md) throw new Error("Unexpected API response: missing market_data");

  return {
    current_price_usd: md.current_price?.usd ?? 0,
    market_cap_usd: md.market_cap?.usd ?? 0,
    total_volume_usd: md.total_volume?.usd ?? 0,
    market_cap_rank: md.market_cap_rank ?? null,
    price_change_percentage_24h: md.price_change_percentage_24h ?? null,
    market_cap_change_percentage_24h: md.market_cap_change_percentage_24h ?? null,
  };
}
