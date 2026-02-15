export type AuditLogEntry = {
  id: string;
  date: string;
  action: string;
  actor: string;
};

const audit: AuditLogEntry[] = [
  { id: "1", date: new Date().toISOString(), action: "Viewed Audit Log", actor: "User" },
  { id: "2", date: new Date(Date.now() - 3600000).toISOString(), action: "Viewed Analytics", actor: "User" },
  { id: "3", date: new Date(Date.now() - 7200000).toISOString(), action: "Changed date range to Last 30 days", actor: "User" },
  { id: "4", date: new Date(Date.now() - 86400000).toISOString(), action: "Selected coins: BTC, ETH", actor: "User" },
  { id: "5", date: new Date(Date.now() - 172800000).toISOString(), action: "Viewed Overview", actor: "User" },
];
let nextId = 6;

export function listAudit(filters: { message?: string; from?: string; to?: string }): AuditLogEntry[] {
  let list = [...audit].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (filters.message?.trim()) {
    const q = filters.message.trim().toLowerCase();
    list = list.filter(
      (e) => e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q)
    );
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

export function addAudit(action: string, actor: string = "User"): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: String(nextId++),
    date: new Date().toISOString(),
    action: action.trim(),
    actor,
  };
  audit.push(entry);
  return entry;
}
