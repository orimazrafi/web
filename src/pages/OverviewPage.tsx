import { FiltersBar } from "../components/FiltersBar/FiltersBar";
import { useUrlFilters } from "../components/FiltersBar/useUrlFilters";
import { TimeSeriesChart } from "../components/Charts/TimeSeriesChart";
import { KpiCards } from "../components/Overview/KpiCards";

export function OverviewPage() {
  const { filters, update } = useUrlFilters();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Overview</h1>

      <FiltersBar filters={filters} onChange={update} />

      <KpiCards />

      <div style={{ marginTop: 24 }}>
        <TimeSeriesChart filters={filters} />
      </div>
    </div>
  );
}

