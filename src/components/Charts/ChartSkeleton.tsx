import Skeleton from "react-loading-skeleton";
import styles from "./ChartSkeleton.module.scss";

export function ChartSkeleton() {
  return (
    <div className={styles.root}>
      <Skeleton width={120} height={16} />
      <div className={styles.chartArea}>
        <div className={styles.yAxis}>
          <Skeleton height="100%" />
        </div>
        <div className={styles.bars}>
          {[40, 60, 80, 55, 70].map((h, i) => (
            <div key={i} className={styles.bar}>
              <Skeleton height={`${h}%`} width={28} />
            </div>
          ))}
        </div>
        <div className={styles.xAxis}>
          <Skeleton height={12} />
        </div>
      </div>
    </div>
  );
}
