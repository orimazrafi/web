import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.scss";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Shown when an error is caught. Receives error and reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Catches rendering and lifecycle errors in the tree so the app doesn’t crash.
 * Does not catch errors in event handlers or async code (e.g. fetch) — handle those locally.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.reset);
      return (
        <div className={styles.root}>
          <div className={styles.card}>
            <div className={styles.title}>Something went wrong</div>
            <p className={styles.message}>{error.message}</p>
            <button type="button" onClick={this.reset} className={styles.button}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
