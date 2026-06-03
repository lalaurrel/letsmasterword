"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** 크기 (sm=20h / md=24h / lg=28h). 다른 form control과 비례 유지. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const trackSizes = {
  sm: "w-[36px] h-[20px]",
  md: "w-[44px] h-[24px]",
  lg: "w-[52px] h-[28px]",
};

const thumbSizes = {
  sm: "w-[16px] h-[16px]",
  md: "w-[20px] h-[20px]",
  lg: "w-[24px] h-[24px]",
};

const thumbTranslate = {
  sm: "translate-x-[16px]",
  md: "translate-x-[20px]",
  lg: "translate-x-[24px]",
};

export function Toggle({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out outline-none",
        checked ? "bg-[var(--color-bg-inverse)]" : "bg-[var(--color-bg-disabled)]",
        disabled && "bg-[var(--color-bg-subtle)] cursor-not-allowed",
        !disabled && "cursor-pointer",
        trackSizes[size],
        className,
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white transition-transform duration-200 ease-in-out",
          checked && thumbTranslate[size],
          disabled && "bg-[var(--color-icon-disabled)]",
          thumbSizes[size],
        )}
      />
    </button>
  );
}

export type { ToggleProps };
