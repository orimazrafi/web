import styles from "../styles/PageLayout.module.scss";

export function AuditLogPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Audit Log</h1>
      <p className={styles.subtitle}>
        Review who did what and when. This page will show a filterable audit log
        of key actions.
      </p>
    </div>
  );
}

