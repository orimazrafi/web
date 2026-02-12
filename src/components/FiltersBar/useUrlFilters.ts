import { useMemo, useState, useCallback, useEffect } from "react";
import type { Filters } from "./types";

function toISODateOnly(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

export type DatePresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisMonth"
  | "lastMonth";

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last14", label: "Last 14 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
];

export function getDateRangeForPreset(
  presetId: DatePresetId,
  refDate: Date = new Date()
): { from: string; to: string } {
  const today = toISODateOnly(refDate);
  const t = refDate.getTime();
  const day = 86400000;

  switch (presetId) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = new Date(t - day);
      const yStr = toISODateOnly(y);
      return { from: yStr, to: yStr };
    }
    case "last7":
      return { from: toISODateOnly(new Date(t - 6 * day)), to: today };
    case "last14":
      return { from: toISODateOnly(new Date(t - 13 * day)), to: today };
    case "last30":
      return { from: toISODateOnly(new Date(t - 29 * day)), to: today };
    case "thisMonth": {
      const d = new Date(refDate);
      d.setDate(1);
      return { from: toISODateOnly(d), to: today };
    }
    case "lastMonth": {
      const d = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      return { from: toISODateOnly(first), to: toISODateOnly(d) };
    }
    default:
      return { from: toISODateOnly(new Date(t - 13 * day)), to: today };
  }
}

export function getPresetIdFromRange(
  from: string,
  to: string,
  refDate: Date = new Date()
): DatePresetId | "custom" {
  for (const preset of DATE_PRESETS) {
    const range = getDateRangeForPreset(preset.id, refDate);
    if (range.from === from && range.to === to) return preset.id;
  }
  return "custom";
}

function readFiltersFromUrl(): Filters {
  const sp = new URLSearchParams(window.location.search);

  const to = sp.get("to");
  const from = sp.get("from");
  const asset = sp.get("asset") ?? "bitcoin";

  // default: last 14 days
  const defaultTo = toISODateOnly(new Date());
  const defaultFrom = toISODateOnly(new Date(Date.now() - 13 * 86400000));

  return {
    from: from ?? defaultFrom,
    to: to ?? defaultTo,
    asset,
  };
}

function writeFiltersToUrl(next: Filters) {
  const sp = new URLSearchParams(window.location.search);

  sp.set("from", next.from);
  sp.set("to", next.to);
  sp.set("asset", next.asset);

  const newUrl = `${window.location.pathname}?${sp.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

export function useUrlFilters() {
  const [filters, setFilters] = useState<Filters>(() => readFiltersFromUrl());

  // keep in sync with back/forward
  useEffect(() => {
    const onPop = () => setFilters(readFiltersFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const update = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      writeFiltersToUrl(next);
      return next;
    });
  }, []);

  return useMemo(() => ({ filters, update }), [filters, update]);
}
