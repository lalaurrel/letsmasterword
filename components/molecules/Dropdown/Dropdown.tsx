"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/components/atoms/Icon/Icon";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** 크기 — TextField와 동일 구조 (sm=36px, md=44px, lg=48px height). */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** 트리거 최소 폭 (기본 "160px"). 옵션 텍스트가 길면 메뉴는 자동 확장됨. */
  minWidth?: string;
  /** 트리거 최대 폭 (기본 "100%"). 부모 컨테이너 폭에 맞춰 가변. */
  maxWidth?: string;
  /** 메뉴 최대 폭 (기본 "320px"). 옵션 라벨이 매우 길 때 잘림 방지. */
  menuMaxWidth?: string;
  className?: string;
}

/* TextField sm/md/lg와 height + text size + padding 정확히 일치. */
const sizeStyles = {
  sm: "h-[36px] text-[14px] px-3",
  md: "h-[44px] text-[16px] px-4",
  lg: "h-[48px] text-[18px] px-5",
};

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  size = "md",
  disabled = false,
  minWidth = "160px",
  maxWidth = "100%",
  menuMaxWidth = "320px",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex", className)}
      style={{ minWidth, maxWidth }}
    >
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 border border-[var(--color-border-default)] rounded-[12px] font-[family-name:var(--font-primary)] transition-colors cursor-pointer",
          sizeStyles[size],
          disabled && "opacity-50 cursor-not-allowed bg-[var(--color-bg-surface)]",
          !disabled && "hover:border-[var(--color-border-hover)]",
          isOpen && "border-[var(--color-border-brand)]",
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            selectedOption ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-disabled)]",
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={cn("flex-shrink-0 transition-transform", isOpen && "rotate-180")}>
          <Icon name="chevron-down" size="sm" color="var(--color-icon-secondary)" />
        </span>
      </button>

      {/* Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute top-full left-0 mt-1 bg-white border border-[var(--color-border-subtle)] rounded-[12px] shadow-[var(--shadow-elevation-mid)] max-h-[240px] overflow-y-auto z-10",
            "animate-[dropdownIn_0.15s_ease-out]",
          )}
          style={{ minWidth: "100%", width: "max-content", maxWidth: menuMaxWidth }}
        >
          {options.map((option) => (
            <div
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "px-4 py-2.5 text-[14px] font-[family-name:var(--font-primary)] cursor-pointer transition-colors whitespace-nowrap",
                option.value === value
                  ? "bg-[var(--color-bg-accent-subtle)] text-[var(--color-text-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]",
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
