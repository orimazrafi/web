import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import styles from "./AnalyticsMultiLineChart.module.scss";

const AXIS_COLOR = "#64748b";
const GRID_COLOR = "rgba(100, 116, 139, 0.15)";
const COLORS = { btc: "#f59e0b", eth: "#6366f1", sol: "#22c55e" };

export type AlignedRow = { date: string; btc: number; eth: number; sol: number };

export type CoinKey = "btc" | "eth" | "sol";

function formatAxisDate(ts: string): string {
  try {
    return format(parseISO(ts), "MMM d");
  } catch {
    return ts;
  }
}

type MetricKind = "price" | "return" | "volatility" | "drawdown";

function formatY(value: number, kind: MetricKind): string {
  if (kind === "price") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  }
  return `${value.toFixed(2)}%`;
}

const DEFAULT_COINS: CoinKey[] = ["btc", "eth", "sol"];

export function AnalyticsMultiLineChart({
  data,
  metricKind,
  title,
  coins = DEFAULT_COINS,
}: {
  data: AlignedRow[];
  metricKind: MetricKind;
  title: string;
  coins?: CoinKey[];
}) {
  const chartData = data.map((r) => ({ ...r, date: r.date }));

  const legendColorClass = (k: CoinKey) =>
    k === "btc" ? styles.legendBtc : k === "eth" ? styles.legendEth : styles.legendSol;

  return (
    <div className={styles.wrapper}>
      {title && <div className={styles.title}>{title}</div>}
      <ResponsiveContainer width="100%" height={title ? 260 : 300}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={(v: number) => formatY(v, metricKind)}
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={metricKind === "price" ? 64 : 48}
            tickMargin={8}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as AlignedRow;
              return (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipDate}>{formatAxisDate(row.date)}</div>
                  <div className={styles.tooltipRows}>
                    {coins.map((k) => (
                      <div key={k} className={styles.tooltipRow}>
                        <span className={`${styles.tooltipLabel} ${styles[k]}`}>
                          {k.toUpperCase()}
                        </span>
                        <span className={styles.tooltipValue}>
                          {formatY(row[k], metricKind)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
            cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }}
          />
          <Legend
            formatter={(value) => {
              const k = value.toLowerCase() as CoinKey;
              return <span className={legendColorClass(k)}>{value}</span>;
            }}
          />
          {coins.map((k) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              name={k.toUpperCase()}
              stroke={COLORS[k]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
