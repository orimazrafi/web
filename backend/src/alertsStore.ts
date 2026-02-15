export type AlertSeverity = "info" | "warn" | "error";

export type AlertLogEntry = {
  id: string;
  date: string;
  message: string;
  severity: AlertSeverity;
};

const alerts: AlertLogEntry[] = [];
let nextId = 1;

export function listAlerts(filters: { message?: string; from?: string; to?: string }): AlertLogEntry[] {
  let list = [...alerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (filters.message?.trim()) {
    const q = filters.message.trim().toLowerCase();
    list = list.filter((e) => e.message.toLowerCase().includes(q));
  }
  if (filters.from) {
    const fromStart = new Date(filters.from).setHours(0, 0, 0, 0);
    list = list.filter((e) => new Date(e.date).getTime() >= fromStart);
  }
  if (filters.to) {
    const toEnd = new Date(filters.to).setHours(23, 59, 59, 999);
    list = list.filter((e) => new Date(e.date).getTime() <= toEnd);
  }
  return list;
}

export function addAlert(message: string, severity: AlertSeverity): AlertLogEntry {
  const entry: AlertLogEntry = {
    id: String(nextId++),
    date: new Date().toISOString(),
    message: message.trim(),
    severity,
  };
  alerts.push(entry);
  return entry;
}
