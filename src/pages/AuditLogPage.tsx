import { useState, useMemo } from "react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import styles from "./AuditLogPage.module.scss";

export type AuditLogEntry = {
  id: string;
  date: string;
  action: string;
  actor: string;
};

const MOCK_AUDIT: AuditLogEntry[] = [
  { id: "1", date: new Date().toISOString(), action: "Viewed Analytics", actor: "User" },
  { id: "2", date: new Date(Date.now() - 3600000).toISOString(), action: "Changed date range to Last 30 days", actor: "User" },
  { id: "3", date: new Date(Date.now() - 86400000).toISOString(), action: "Selected coins: BTC, ETH", actor: "User" },
  { id: "4", date: new Date(Date.now() - 172800000).toISOString(), action: "Viewed Overview", actor: "User" },
];

function filterByDateRange(list: AuditLogEntry[], from: string, to: string): AuditLogEntry[] {
  if (!from && !to) return list;
  return list.filter((e) => {
    const d = parseISO(e.date).getTime();
    if (from && d < startOfDay(new Date(from)).getTime()) return false;
    if (to && d > endOfDay(new Date(to)).getTime()) return false;
    return true;
  });
}

function filterByMessage(list: AuditLogEntry[], query: string): AuditLogEntry[] {
  if (!query.trim()) return list;
  const q = query.trim().toLowerCase();
  return list.filter((e) => e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q));
}

export function AuditLogPage() {
  const [filterMessage, setFilterMessage] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const filtered = useMemo(() => {
    let list = filterByMessage(MOCK_AUDIT, filterMessage);
    list = filterByDateRange(list, filterFrom, filterTo);
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filterMessage, filterFrom, filterTo]);

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Audit Log</h1>
      <p className={styles.subtitle}>
        Who did what and when. Filter by message or date range.
      </p>

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
        <ul className={styles.logList}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>No entries match the filters.</li>
          ) : (
            filtered.map((entry) => (
              <li key={entry.id} className={styles.logItem}>
                <span className={styles.logDate}>{format(parseISO(entry.date), "yyyy-MM-dd HH:mm")}</span>
                <span className={styles.logAction}>{entry.action}</span>
                <span className={styles.logActor}>{entry.actor}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
