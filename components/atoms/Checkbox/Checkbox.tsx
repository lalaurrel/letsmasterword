"use client";

import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  label,
  className,
}: CheckboxProps) {
  const handleToggle = () => {
    if (!disabled) onChange?.(!checked);
  };

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-2 select-none",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        tabIndex={-1}
        className={cn(
          "w-[20px] h-[20px] rounded-[var(--radius-2xs)] flex items-center justify-center transition-colors outline-none shrink-0",
          checked
            ? "bg-[var(--color-bg-inverse)] border-2 border-[var(--color-bg-inverse)]"
            : "bg-white border-2 border-[var(--color-border-default)]",
          disabled && "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)]",
          !disabled && "cursor-pointer",
        )}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke={disabled ? "var(--color-icon-disabled)" : "white"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {label && (
        <span
          className={cn(
            "text-[14px] font-[family-name:var(--font-primary)] text-[var(--color-text-secondary)]",
            disabled && "text-[var(--color-text-disabled)]",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export type { CheckboxProps };
