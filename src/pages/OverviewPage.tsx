import { FiltersBar } from "../components/FiltersBar/FiltersBar";
import { useUrlFilters } from "../components/FiltersBar/useUrlFilters";
import { TimeSeriesChart } from "../components/Charts/TimeSeriesChart";
import { KpiCards } from "../components/Overview/KpiCards";
import styles from "../styles/PageLayout.module.scss";

export function OverviewPage() {
  const { filters, update } = useUrlFilters();

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Overview · Crypto</h1>
      <FiltersBar filters={filters} onChange={update} />
      <KpiCards asset={filters.asset} />
      <div className={styles.section}>
        <TimeSeriesChart filters={filters} />
      </div>
    </div>
  );
}

