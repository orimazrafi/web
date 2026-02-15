import { type SelectHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./Select.module.scss";

export type SelectOption = { value: string; label: string };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  label,
  options,
  placeholder,
  className,
  id,
  ...rest
}: SelectProps) {
  const selectId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={styles.label}>
      {label != null && (
        <label htmlFor={selectId} className={styles.labelText}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(styles.select, className)}
        {...rest}
      >
        {placeholder != null && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
