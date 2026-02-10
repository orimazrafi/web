import { useState } from "react";
import { OverviewPage } from "./pages/OverviewPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { OperationsPage } from "./pages/OperationsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AuditLogPage } from "./pages/AuditLogPage";

export default function App() {
  type PageKey = "overview" | "analytics" | "operations" | "alerts" | "audit-log";
  const [page, setPage] = useState<PageKey>("overview");

  const items: { key: PageKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "analytics", label: "Analytics" },
    { key: "operations", label: "Operations" },
    { key: "alerts", label: "Alerts" },
    { key: "audit-log", label: "Audit Log" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <aside
        style={{
          width: 220,
          borderRight: "1px solid #111827",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "radial-gradient(circle at top, #020617 0, #020617 40%, #020617)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Ops &amp; Insights
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Dashboard
        </div>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 8,
          }}
        >
          {items.map(item => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setPage(item.key)}
                style={{
                  textAlign: "left",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 14,
                  backgroundColor: active ? "#0f172a" : "transparent",
                  color: active ? "#e5e7eb" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.label}</span>
                {active && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "999px",
                      backgroundColor: "#22c55e",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
      <main style={{ flex: 1 }}>
        {page === "overview" && <OverviewPage />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "operations" && <OperationsPage />}
        {page === "alerts" && <AlertsPage />}
        {page === "audit-log" && <AuditLogPage />}
      </main>
    </div>
  );
}