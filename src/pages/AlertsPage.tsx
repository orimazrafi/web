import { useState, useMemo } from "react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import styles from "./AlertsPage.module.scss";
import { Button } from "../components/ui/Button";

export type AlertSeverity = "info" | "warn" | "error";

export type AlertLogEntry = {
  id: string;
  date: string;
  message: string;
  severity: AlertSeverity;
};

const MOCK_ENTRIES: AlertLogEntry[] = [
  { id: "1", date: new Date().toISOString(), message: "BTC price crossed 100k threshold", severity: "info" },
  { id: "2", date: new Date(Date.now() - 86400000).toISOString(), message: "High volatility detected on ETH", severity: "warn" },
  { id: "3", date: new Date(Date.now() - 172800000).toISOString(), message: "API rate limit approached", severity: "warn" },
  { id: "4", date: new Date(Date.now() - 259200000).toISOString(), message: "Daily sync completed successfully", severity: "info" },
];

function filterByMessage(list: AlertLogEntry[], query: string): AlertLogEntry[] {
  if (!query.trim()) return list;
  const q = query.trim().toLowerCase();
  return list.filter((e) => e.message.toLowerCase().includes(q));
}

function filterByDateRange(list: AlertLogEntry[], from: string, to: string): AlertLogEntry[] {
  if (!from && !to) return list;
  return list.filter((e) => {
    const d = parseISO(e.date).getTime();
    if (from) {
      const fromStart = startOfDay(new Date(from)).getTime();
      if (d < fromStart) return false;
    }
    if (to) {
      const toEnd = endOfDay(new Date(to)).getTime();
      if (d > toEnd) return false;
    }
    return true;
  });
}

export function AlertsPage() {
  const [entries, setEntries] = useState<AlertLogEntry[]>(MOCK_ENTRIES);
  const [filterMessage, setFilterMessage] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newSeverity, setNewSeverity] = useState<AlertSeverity>("info");

  const filtered = useMemo(() => {
    let list = filterByMessage(entries, filterMessage);
    list = filterByDateRange(list, filterFrom, filterTo);
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, filterMessage, filterFrom, filterTo]);

  const addEntry = () => {
    if (!newMessage.trim()) return;
    setEntries((prev) => [
      {
        id: String(Date.now()),
        date: new Date().toISOString(),
        message: newMessage.trim(),
        severity: newSeverity,
      },
      ...prev,
    ]);
    setNewMessage("");
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Alerts</h1>
      <p className={styles.subtitle}>
        Alert log history. Add entries and filter by message or date range.
      </p>

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
            />
          </div>
          <div className={styles.formGroup}>
            <label>Severity</label>
            <select
              className={styles.select}
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as AlertSeverity)}
            >
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
          <Button onClick={addEntry}>Add log</Button>
        </div>
      </div>

      <div className={styles.card}>
        <ul className={styles.logList}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>No entries match the filters.</li>
          ) : (
            filtered.map((entry) => (
              <li key={entry.id} className={styles.logItem}>
                <span className={styles.logDate}>{format(parseISO(entry.date), "yyyy-MM-dd HH:mm")}</span>
                <span className={styles.logMessage}>{entry.message}</span>
                <span className={`${styles.badge} ${styles[entry.severity]}`}>{entry.severity}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
