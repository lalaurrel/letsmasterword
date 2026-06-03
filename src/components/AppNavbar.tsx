import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

export type ViewKey = "home" | "vocabulary" | "speech";

interface NavItem {
  key: ViewKey;
  label: string;
}

const NAV: NavItem[] = [
  { key: "vocabulary", label: "Vocabulary" },
  { key: "speech", label: "Speech" },
];

interface AppNavbarProps {
  active: ViewKey;
  onChange: (key: ViewKey) => void;
}

/** 상단 내비게이션 — 브랜드(클릭 시 홈) + Vocabulary / Speech 메뉴. */
export function AppNavbar({ active, onChange }: AppNavbarProps) {
  return (
    <div className="flex justify-center pb-2 pt-5">
      <nav
        aria-label="Main navigation"
        className="flex w-full max-w-[760px] items-center justify-between gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-canvas)] py-2 pl-3 pr-2 shadow-[var(--shadow-elevation-mid)]"
      >
        <Logo onClick={() => onChange("home")} />

        <div className="flex items-center gap-1">
          {NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onChange(item.key)}
                className={cn(
                  "h-[38px] rounded-full px-3 text-[14px] transition-colors cursor-pointer sm:px-4 sm:text-[15px]",
                  isActive
                    ? "bg-[var(--color-bg-inverse)] text-white font-medium"
                    : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
