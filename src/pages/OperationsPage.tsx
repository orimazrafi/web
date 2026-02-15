import styles from "../styles/PageLayout.module.scss";

export function OperationsPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Operations</h1>
      <p className={styles.subtitle}>
        Monitor incidents, statuses, and operational health. Here you can later add
        an incidents list, status chips, and create/update actions.
      </p>
    </div>
  );
}

