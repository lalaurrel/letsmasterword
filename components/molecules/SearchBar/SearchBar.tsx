"use client";

import { cn } from "@/lib/cn";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

function SearchIcon({ color = "var(--color-icon-secondary)" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M13.5 13.5L17 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  className,
}: SearchBarProps) {
  return (
    <div
      role="search"
      className={cn(
        "flex items-center border border-[var(--color-border-default)] rounded-[12px] h-[44px] px-3 gap-2 transition-colors focus-within:border-[var(--color-border-brand)]",
        className,
      )}
    >
      <span className="flex-shrink-0" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch(value);
          }
        }}
        placeholder={placeholder}
        /* 브라우저 native clear 버튼 제거 — 우리 커스텀 X와 중복 방지.
           type="search" semantic은 유지 (a11y / 모바일 키보드 search 액션). */
        className="flex-1 text-[16px] bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] font-[family-name:var(--font-primary)] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-ms-clear]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => onChange?.("")}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M4 4L10 10M10 4L4 10" stroke="var(--color-icon-secondary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
