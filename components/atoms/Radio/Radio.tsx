"use client";

import { cn } from "@/lib/cn";

interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  name?: string;
  className?: string;
}

export function Radio({
  checked = false,
  onChange,
  disabled = false,
  label,
  name,
  className,
}: RadioProps) {
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
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        data-name={name}
        tabIndex={-1}
        className={cn(
          "w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors outline-none shrink-0",
          checked
            ? "border-2 border-[var(--color-bg-inverse)]"
            : "border-2 border-[var(--color-border-default)]",
          disabled && "border-[var(--color-border-subtle)]",
          !disabled && "cursor-pointer",
          "bg-white",
        )}
      >
        {checked && (
          <span
            className={cn(
              "w-[10px] h-[10px] rounded-full",
              disabled ? "bg-[var(--color-icon-disabled)]" : "bg-[var(--color-bg-inverse)]",
            )}
          />
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

export type { RadioProps };
