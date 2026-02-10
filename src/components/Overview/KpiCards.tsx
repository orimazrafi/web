type Kpi = {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
};

const MOCK_KPIS: Kpi[] = [
  { label: "Active Incidents", value: "3", delta: "+1", deltaLabel: "since yesterday" },
  { label: "Requests / min", value: "12.4k", delta: "+4.2%", deltaLabel: "vs last hour" },
  { label: "Error Rate", value: "0.18%", delta: "-0.05%", deltaLabel: "vs last hour" },
  { label: "P95 Latency", value: "420 ms", delta: "-35 ms", deltaLabel: "vs last hour" },
];

export function KpiCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginTop: 24,
      }}
    >
      {MOCK_KPIS.map(kpi => (
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
          {kpi.delta && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#7dd3fc" }}>
              {kpi.delta} <span style={{ color: "#777" }}>{kpi.deltaLabel}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

