import type { Filters } from "../components/FiltersBar/types";

export type TimeseriesPoint = { ts: string; value: number };

export async function fetchTimeseries(filters: Filters): Promise<TimeseriesPoint[]> {
  await new Promise((r) => setTimeout(r, 400));

  // Use date range to determine number of points
  const from = new Date(filters.from);
  const to = new Date(filters.to);
  const days = Math.max(1, Math.min(60, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1));

  const base = 200
    + (filters.source?.length ? filters.source.length * 50 : 0)
    + (filters.type?.length ? filters.type.length * 30 : 0);

  return Array.from({ length: days }).map((_, i) => {
    const ts = new Date(from.getTime() + i * 86400000).toISOString();
    const noise = Math.floor(Math.random() * 120);
    return { ts, value: base + noise };
  });
}
 