import { useState } from "react";
import { OverviewPage } from "./pages/OverviewPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { OperationsPage } from "./pages/OperationsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import styles from "./App.module.scss";

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
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.title}>Crypto Insights</div>
        <div className={styles.subtitle}>Markets Dashboard</div>
        <nav className={styles.nav}>
          {items.map((item) => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setPage(item.key)}
                className={`${styles.navButton} ${active ? styles.active : ""}`}
              >
                <span>{item.label}</span>
                {active && <span className={styles.navDot} />}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className={styles.main}>
        {page === "overview" && <OverviewPage />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "operations" && <OperationsPage />}
        {page === "alerts" && <AlertsPage />}
        {page === "audit-log" && <AuditLogPage />}
      </main>
    </div>
  );
}