import { useEffect, useState } from "react";
import type { Filters } from "./types";
import {
  DATE_PRESETS,
  type DatePresetId,
  getDateRangeForPreset,
  getPresetIdFromRange,
} from "./useUrlFilters";
import styles from "./FiltersBar.module.scss";

const ASSETS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
  { id: "solana", label: "Solana (SOL)" },
  { id: "dogecoin", label: "Dogecoin (DOGE)" },
] as const;

export function FiltersBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  // Which preset (if any) the current from/to dates match. Does not change when user picks "Custom" until they edit the dates.
  const presetFromDates = getPresetIdFromRange(filters.from, filters.to);
  const [userChoseCustom, setUserChoseCustom] = useState(false);
  const datePreset = userChoseCustom ? "custom" : presetFromDates;
  const isCustom = datePreset === "custom";

  useEffect(() => {
    if (presetFromDates !== "custom") setUserChoseCustom(false);
  }, [filters.from, filters.to, presetFromDates]);

  return (
    <div className={styles.root}>
      <label className={styles.label}>
        <span>Date range</span>
        <select
          value={datePreset}
          onChange={(e) => {
            const id = e.target.value as DatePresetId | "custom";
            if (id === "custom") {
              setUserChoseCustom(true);
            } else {
              setUserChoseCustom(false);
              onChange(getDateRangeForPreset(id));
            }
          }}
          className={styles.selectDate}
        >
          {DATE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>

      {isCustom && (
        <>
          <label className={styles.label}>
            <span>From</span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onChange({ from: e.target.value })}
            />
          </label>
          <label className={styles.label}>
            <span>To</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onChange({ to: e.target.value })}
            />
          </label>
        </>
      )}

      <label className={styles.label}>
        <span>Asset</span>
        <select
          value={filters.asset}
          onChange={(e) => onChange({ asset: e.target.value })}
          className={styles.selectAsset}
        >
          {ASSETS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
