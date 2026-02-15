import { useState } from "react";
import { format, parseISO } from "date-fns";
import styles from "./AuditLogPage.module.scss";
import { useAuditLog } from "../api/useAuditLog";

export function AuditLogPage() {
  const [filterMessage, setFilterMessage] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const { data: entries = [], isLoading, error } = useAuditLog({
    message: filterMessage || undefined,
    from: filterFrom || undefined,
    to: filterTo || undefined,
  });

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Audit Log</h1>
      <p className={styles.subtitle}>
        Who did what and when (from API). Filter by message or date range.
      </p>

      {error && (
        <div className={styles.card} style={{ color: "#fca5a5", marginBottom: 16 }}>
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <span className={styles.toolbarLabel}>Filter by message or actor</span>
          <input
            type="text"
            className={styles.input}
            placeholder="Search..."
            value={filterMessage}
            onChange={(e) => setFilterMessage(e.target.value)}
          />
        </div>
        <div className={styles.toolbarGroup}>
          <span className={styles.toolbarLabel}>From date</span>
          <input
            type="date"
            className={styles.input}
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>
        <div className={styles.toolbarGroup}>
          <span className={styles.toolbarLabel}>To date</span>
          <input
            type="date"
            className={styles.input}
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.card}>
        {isLoading ? (
          <div className={styles.empty}>Loading…</div>
        ) : (
          <ul className={styles.logList}>
            {entries.length === 0 ? (
              <li className={styles.empty}>
                {error
                  ? "Start the backend to use audit log."
                  : "No entries match the filters."}
              </li>
            ) : (
              entries.map((entry) => (
                <li key={entry.id} className={styles.logItem}>
                  <span className={styles.logDate}>
                    {format(parseISO(entry.date), "yyyy-MM-dd HH:mm")}
                  </span>
                  <span className={styles.logAction}>{entry.action}</span>
                  <span className={styles.logActor}>{entry.actor}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
