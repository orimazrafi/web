import styles from "../styles/PageLayout.module.scss";

export function AlertsPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Alerts</h1>
      <p className={styles.subtitle}>
        Configure and review alerts for your key metrics. An alerts panel will
        live here soon.
      </p>
    </div>
  );
}

