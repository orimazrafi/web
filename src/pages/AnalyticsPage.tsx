import { useState, useMemo } from "react";
import { useMultiTimeseries } from "../api/useMultiTimeseries";
import {
  getDateRangeForPreset,
  getPresetIdFromRange,
  DATE_PRESETS,
  type DatePresetId,
} from "../components/FiltersBar/useUrlFilters";
import {
  alignSeries,
  computeReturnSeries,
  computeVolatilitySeries,
  computeDrawdownSeries,
  correlationMatrix,
} from "./analyticsUtils";
import { AnalyticsMultiLineChart } from "../components/Charts/AnalyticsMultiLineChart";
import { ChartSkeleton } from "../components/Charts/ChartSkeleton";
import styles from "./AnalyticsPage.module.scss";

type MetricToggle = "price" | "return" | "volatility";
type CoinKey = "btc" | "eth" | "sol";

const COINS: { id: CoinKey; label: string }[] = [
  { id: "btc", label: "BTC" },
  { id: "eth", label: "ETH" },
  { id: "sol", label: "SOL" },
];

const DEFAULT_RANGE = getDateRangeForPreset("last30");
const DEFAULT_COINS: CoinKey[] = ["btc", "eth", "sol"];

const COIN_CLASS: Record<CoinKey, string> = {
  btc: styles.coinBtc,
  eth: styles.coinEth,
  sol: styles.coinSol,
};

export function AnalyticsPage() {
  const [range, setRange] = useState<{ from: string; to: string }>(DEFAULT_RANGE);
  const [metric, setMetric] = useState<MetricToggle>("price");
  const [selectedCoins, setSelectedCoins] = useState<CoinKey[]>(DEFAULT_COINS);

  const toggleCoin = (id: CoinKey) => {
    setSelectedCoins((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      return next.length > 0 ? next : [id];
    });
  };

  const { data: rawData, isLoading, error } = useMultiTimeseries(range.from, range.to);

  const { aligned, returnSeries, volatilitySeries, drawdownSeries, correlation } = useMemo(() => {
    if (!rawData || !rawData.bitcoin?.length) {
      return {
        aligned: [],
        returnSeries: [],
        volatilitySeries: [],
        drawdownSeries: [],
        correlation: {} as Record<string, Record<string, number>>,
      };
    }
    const aligned = alignSeries(rawData);
    return {
      aligned,
      returnSeries: computeReturnSeries(aligned),
      volatilitySeries: computeVolatilitySeries(aligned),
      drawdownSeries: computeDrawdownSeries(aligned),
      correlation: correlationMatrix(aligned),
    };
  }, [rawData]);

  const mainChartData = useMemo(() => {
    if (metric === "price") return aligned;
    if (metric === "return") return returnSeries;
    return volatilitySeries;
  }, [metric, aligned, returnSeries, volatilitySeries]);

  const metricKind = metric === "price" ? "price" : metric === "return" ? "return" : "volatility";

  const labels: { id: MetricToggle; label: string }[] = [
    { id: "price", label: "Price" },
    { id: "return", label: "% Return" },
    { id: "volatility", label: "Volatility" },
  ];

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Analytics</h1>
      <p className={styles.subtitle}>
        Compare BTC, ETH & SOL — price, returns, volatility, drawdown and correlation.
      </p>

      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <span className={styles.toolbarLabel}>Coins</span>
          <div className={styles.coinToggles}>
            {COINS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleCoin(id)}
                className={`${styles.toggle} ${selectedCoins.includes(id) ? styles.active : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className={styles.toolbarGroup}>
          <span className={styles.toolbarLabel}>Range</span>
          <select
            value={getPresetIdFromRange(range.from, range.to)}
            onChange={(e) => {
              const id = e.target.value as DatePresetId | "custom";
              if (id && id !== "custom") setRange(getDateRangeForPreset(id));
            }}
            className={styles.select}
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </label>
        <div className={styles.metricToggles}>
          {labels.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMetric(id)}
              className={`${styles.toggle} ${metric === id ? styles.active : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {isLoading && !rawData && (
        <div className={styles.chartWrap}>
          <ChartSkeleton />
        </div>
      )}

      {rawData && (
        <>
          <div className={styles.chartWrap}>
            <AnalyticsMultiLineChart
              data={mainChartData}
              metricKind={metricKind}
              coins={selectedCoins}
              title={
                metric === "price"
                  ? "Price (USD)"
                  : metric === "return"
                    ? "% return from start of period"
                    : "Volatility (annualized %)"
              }
            />
          </div>

          <div className={styles.chartWrap}>
            <AnalyticsMultiLineChart
              data={drawdownSeries}
              metricKind="drawdown"
              coins={selectedCoins}
              title="Drawdown (%)"
            />
          </div>

          {Object.keys(correlation).length > 0 && selectedCoins.length >= 2 && (
            <div className={styles.correlationCard}>
              <div className={styles.correlationTitle}>Correlation (daily returns)</div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thLeft} />
                    {selectedCoins.map((c) => (
                      <th key={c} className={`${styles.thCenter} ${COIN_CLASS[c]}`}>
                        {c.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedCoins.map((row) => (
                    <tr key={row}>
                      <td className={`${styles.tdRowLabel} ${COIN_CLASS[row]}`}>
                        {row.toUpperCase()}
                      </td>
                      {selectedCoins.map((col) => (
                        <td key={col} className={styles.tdCell}>
                          {correlation[row]?.[col] != null ? correlation[row][col].toFixed(3) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
