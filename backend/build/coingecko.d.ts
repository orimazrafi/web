export type TimeseriesPoint = {
    ts: string;
    value: number;
};
export declare function fetchTimeseriesByCoin(coinId: string, from: string, to: string): Promise<TimeseriesPoint[]>;
export type CoinMarketData = {
    current_price_usd: number;
    market_cap_usd: number;
    total_volume_usd: number;
    market_cap_rank: number | null;
    price_change_percentage_24h: number | null;
    market_cap_change_percentage_24h: number | null;
};
export declare function fetchCoinMarketData(coinId: string): Promise<CoinMarketData>;
//# sourceMappingURL=coingecko.d.ts.map