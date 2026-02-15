import { type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./Button.module.scss";

export type ButtonVariant = "default" | "primary" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  active?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "default",
  active = false,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.button, variant !== "default" && styles[variant], active && styles.active, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
