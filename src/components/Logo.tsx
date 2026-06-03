import { Icon } from "@/lib/components/atoms/Icon/Icon";
import { cn } from "@/lib/cn";

interface LogoProps {
  onClick?: () => void;
  /** 워드마크 크기 (기본 md). */
  size?: "md" | "lg";
}

const wordSize = {
  md: "text-[22px]",
  lg: "text-[26px]",
};

const markSize = {
  md: "h-9 w-9 rounded-[10px]",
  lg: "h-10 w-10 rounded-[12px]",
};

/** Speakly 로고 — 인디고 배지(발음 아이콘) + 워드마크. 디자인 시스템 토큰 사용. */
export function Logo({ onClick, size = "md" }: LogoProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex flex-shrink-0 items-center justify-center bg-[var(--color-brand-primary)] shadow-[var(--shadow-section-md)] transition-transform duration-200 group-hover:scale-105",
          markSize[size],
        )}
      >
        <Icon name="speak" size={size === "lg" ? "lg" : "md"} color="#ffffff" />
      </span>
      <span
        className={cn(
          "font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]",
          wordSize[size],
        )}
      >
        Speakly
      </span>
    </>
  );

  if (!onClick) {
    return <span className="group inline-flex items-center gap-2">{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Speakly 홈"
      className="group inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)] rounded-[12px]"
    >
      {content}
    </button>
  );
}
