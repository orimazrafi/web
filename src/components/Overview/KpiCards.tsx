import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useCoinMarketData } from "../../api/useCoinMarketData";
import styles from "./KpiCards.module.scss";

const SKELETON_THEME = { baseColor: "#222", highlightColor: "#333" };

function KpiCardsSkeleton() {
  return (
    <div className={styles.grid}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.card}>
          <div className={styles.skeletonTitle}>
            <Skeleton width={80} height={12} {...SKELETON_THEME} />
          </div>
          <Skeleton width={100} height={24} {...SKELETON_THEME} />
          {i <= 2 && (
            <div className={styles.skeletonDelta}>
              <Skeleton width={60} height={12} {...SKELETON_THEME} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
    return <KpiCardsSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        Failed to load market data: {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  const kpis = data ? marketDataToKpis(data) : [];

  return (
    <div className={styles.grid}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className={styles.card}>
          <div className={styles.label}>{kpi.label}</div>
          <div className={styles.value}>{kpi.value}</div>
          {kpi.delta != null && (
            <div className={styles.delta}>
              {kpi.delta} <span className={styles.deltaLabel}>{kpi.deltaLabel}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
