import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { Filters } from "../FiltersBar/types";
import { useTimeseries } from "../../api/useTimeseries";
import { ChartSkeleton } from "./ChartSkeleton";
import styles from "./TimeSeriesChart.module.scss";

const AXIS_COLOR = "#64748b";
const GRID_COLOR = "rgba(100, 116, 139, 0.15)";
const LINE_COLOR = "#38bdf8";
const FILL_OPACITY = 0.2;

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisDate(ts: string): string {
  try {
    return format(parseISO(ts), "MMM d");
  } catch {
    return ts;
  }
}

export function TimeSeriesChart({ filters }: { filters: Filters }) {
  const { data, isLoading, isFetching } = useTimeseries(filters);

  if (isLoading && !data) {
    return <ChartSkeleton />;
  }

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={FILL_OPACITY} />
              <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="ts"
            tickFormatter={formatAxisDate}
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={(v: number) => formatPrice(v)}
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickMargin={8}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as { ts: string; value: number };
              return (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipDate}>{formatAxisDate(point.ts)}</div>
                  <div className={styles.tooltipValue}>{formatPrice(point.value)}</div>
                </div>
              );
            }}
            cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            fill="url(#chartFill)"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: LINE_COLOR, stroke: "#0f1115", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {isFetching && data && (
        <div className={styles.updatingOverlay}>
          <span className={styles.updatingBadge}>Updating…</span>
        </div>
      )}
    </div>
  );
}
