import { useQuery } from "@tanstack/react-query";
import { fetchTimeseries } from "./client";
import type { Filters } from "../components/FiltersBar/types";

export function useTimeseries(filters: Filters) {
  return useQuery({
    queryKey: ["timeseries", filters],
    queryFn: () => fetchTimeseries(filters),
    placeholderData: prev => prev,
  });
}
