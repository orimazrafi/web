import { useState } from "react";
import { format, parseISO } from "date-fns";
import styles from "./AlertsPage.module.scss";
import { Button } from "../components/ui/Button";
import { useAlerts, useAddAlert } from "../api/useAlerts";
import type { AlertSeverity } from "../api/client";

export function AlertsPage() {
  const [filterMessage, setFilterMessage] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newSeverity, setNewSeverity] = useState<AlertSeverity>("info");

  const { data: entries = [], isLoading, error } = useAlerts({
    message: filterMessage || undefined,
    from: filterFrom || undefined,
    to: filterTo || undefined,
  });
  const addMutation = useAddAlert();

  const addEntry = () => {
    if (!newMessage.trim()) return;
    addMutation.mutate(
      { message: newMessage.trim(), severity: newSeverity },
      { onSuccess: () => setNewMessage("") }
    );
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Alerts</h1>
      <p className={styles.subtitle}>
        Alert log history from the API. Add entries and filter by message or date range.
      </p>

      {error && (
        <div className={styles.card} style={{ color: "#fca5a5", marginBottom: 16 }}>
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <span className={styles.toolbarLabel}>Filter by message</span>
          <input
            type="text"
            className={styles.input}
            placeholder="Search message..."
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
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ flex: 1, minWidth: 200 }}>
            <label>New log message</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Manual check completed"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEntry()}
              disabled={!!error}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Severity</label>
            <select
              className={styles.select}
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as AlertSeverity)}
              disabled={!!error}
            >
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
          <Button onClick={addEntry} disabled={!!error || addMutation.isPending}>
            {addMutation.isPending ? "Adding…" : "Add log"}
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        {isLoading ? (
          <div className={styles.empty}>Loading…</div>
        ) : (
          <ul className={styles.logList}>
            {entries.length === 0 ? (
              <li className={styles.empty}>
                {error ? "Start the backend to use alerts." : "No entries match the filters."}
              </li>
            ) : (
              entries.map((entry) => (
                <li key={entry.id} className={styles.logItem}>
                  <span className={styles.logDate}>
                    {format(parseISO(entry.date), "yyyy-MM-dd HH:mm")}
                  </span>
                  <span className={styles.logMessage}>{entry.message}</span>
                  <span className={`${styles.badge} ${styles[entry.severity]}`}>
                    {entry.severity}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
