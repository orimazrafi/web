import type { Filters } from "./types";

const SOURCES = ["google", "facebook", "tiktok", "organic", "referral"] as const;
const TYPES = ["page_view", "signup", "purchase", "error", "recommendation_shown", "recommendation_accepted"] as const;

export function FiltersBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "end", marginBottom: 16 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>From</span>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ from: e.target.value })}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>To</span>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ to: e.target.value })}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Source</span>
        <select
          multiple
          value={filters.source ?? []}
          onChange={(e) => {
            const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange({ source: vals.length ? vals : undefined });
          }}
          style={{ minWidth: 180, height: 90 }}
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Type</span>
        <select
          multiple
          value={filters.type ?? []}
          onChange={(e) => {
            const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange({ type: vals.length ? vals : undefined });
          }}
          style={{ minWidth: 240, height: 90 }}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
