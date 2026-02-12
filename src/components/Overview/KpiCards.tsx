import { useCoinMarketData } from "../../api/useCoinMarketData";

type Kpi = {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
};

function formatUSD(n: number, compact = true): string {
  if (compact && n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (compact && n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (compact && n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n);
}

function formatPercent(p: number | null): string | undefined {
  if (p == null || Number.isNaN(p)) return undefined;
  const sign = p >= 0 ? "+" : "";
  return `${sign}${p.toFixed(2)}%`;
}

function marketDataToKpis(data: {
  current_price_usd: number;
  market_cap_usd: number;
  total_volume_usd: number;
  market_cap_rank: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_percentage_24h: number | null;
}): Kpi[] {
  return [
    {
      label: "Price (USD)",
      value: formatUSD(data.current_price_usd, false),
      delta: formatPercent(data.price_change_percentage_24h),
      deltaLabel: "24h change",
    },
    {
      label: "Market Cap",
      value: formatUSD(data.market_cap_usd),
      delta: formatPercent(data.market_cap_change_percentage_24h),
      deltaLabel: "24h change",
    },
    {
      label: "24h Volume",
      value: formatUSD(data.total_volume_usd),
    },
    {
      label: "Market Cap Rank",
      value: data.market_cap_rank != null ? `#${data.market_cap_rank}` : "—",
    },
  ];
}

export function KpiCards({ asset }: { asset: string }) {
  const { data, isLoading, error } = useCoinMarketData(asset);

  if (isLoading && !data) {
    return (
      <div style={{ marginTop: 24, color: "#999" }}>
        Loading KPIs…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: 24, color: "#e11" }}>
        Failed to load market data: {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  const kpis = data ? marketDataToKpis(data) : [];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginTop: 24,
      }}
    >
      {kpis.map(kpi => (
        <div
          key={kpi.label}
          style={{
            padding: 16,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
          }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.06,
              color: "#999",
              marginBottom: 8,
            }}
          >
            {kpi.label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{kpi.value}</div>
          {kpi.delta != null && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#7dd3fc" }}>
              {kpi.delta} <span style={{ color: "#777" }}>{kpi.deltaLabel}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
