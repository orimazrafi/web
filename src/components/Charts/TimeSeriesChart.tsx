import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Filters } from "../FiltersBar/types";
import { useTimeseries } from "../../api/useTimeseries";
import { ChartSkeleton } from "./ChartSkeleton";

export function TimeSeriesChart({ filters }: { filters: Filters }) {
  const { data, isLoading, isFetching } = useTimeseries(filters);

  if (isLoading && !data) {
    return <ChartSkeleton />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: 320,
        border: "1px solid #444",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="ts" hide />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      {isFetching && data && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.6))",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#e5e5e5",
              background: "rgba(15,15,15,0.9)",
              borderRadius: 999,
              padding: "4px 10px",
              border: "1px solid rgba(75,75,75,0.9)",
            }}
          >
            Refreshing… data may be up to 30s old
          </div>
        </div>
      )}
    </div>
  );
}
