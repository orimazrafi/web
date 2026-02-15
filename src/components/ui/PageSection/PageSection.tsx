import { type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./PageSection.module.scss";

export type PageSectionProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  titleTight?: boolean;
  subtitle?: ReactNode;
  children: ReactNode;
};

export function PageSection({
  title,
  titleTight = false,
  subtitle,
  className,
  children,
  ...rest
}: PageSectionProps) {
  return (
    <div className={clsx(styles.root, className)} {...rest}>
      {title != null && (
        <h1 className={titleTight ? styles.titleTight : styles.title}>{title}</h1>
      )}
      {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </div>
  );
}

export function PageSectionBlock({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={clsx(styles.section, className)} {...rest}>
      {children}
    </div>
  );
}
