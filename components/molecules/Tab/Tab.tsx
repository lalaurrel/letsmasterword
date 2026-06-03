"use client";

import { cn } from "@/lib/cn";

interface TabItem {
  label: string;
  value: string;
}

interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tab({ tabs, activeTab, onChange, className }: TabProps) {
  return (
    <div role="tablist" className={cn("flex border-b border-[var(--color-border-subtle)]", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "px-4 py-2.5 text-[14px] font-[family-name:var(--font-primary)] transition-colors duration-200 relative cursor-pointer",
              isActive
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-bg-inverse)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export type { TabItem, TabProps };
