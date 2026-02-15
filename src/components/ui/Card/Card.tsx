import { type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./Card.module.scss";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={clsx(styles.card, className)} {...rest}>
      {children}
    </div>
  );
}
