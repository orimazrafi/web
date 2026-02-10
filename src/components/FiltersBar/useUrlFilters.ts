import { useMemo, useState, useCallback, useEffect } from "react";
import type { Filters } from "./types";

function toISODateOnly(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function parseArray(v: string | null) {
  if (!v) return undefined;
  const arr = v.split(",").map((x) => x.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

function readFiltersFromUrl(): Filters {
  const sp = new URLSearchParams(window.location.search);

  const to = sp.get("to");
  const from = sp.get("from");

  // default: last 14 days
  const defaultTo = toISODateOnly(new Date());
  const defaultFrom = toISODateOnly(new Date(Date.now() - 13 * 86400000));

  return {
    from: from ?? defaultFrom,
    to: to ?? defaultTo,
    source: parseArray(sp.get("source")),
    type: parseArray(sp.get("type")),
  };
}

function writeFiltersToUrl(next: Filters) {
  const sp = new URLSearchParams(window.location.search);

  sp.set("from", next.from);
  sp.set("to", next.to);

  if (next.source?.length) sp.set("source", next.source.join(","));
  else sp.delete("source");

  if (next.type?.length) sp.set("type", next.type.join(","));
  else sp.delete("type");

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
