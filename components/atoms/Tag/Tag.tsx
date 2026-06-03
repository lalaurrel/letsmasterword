import { cn } from "@/lib/cn";

interface TagProps {
  children: React.ReactNode;
  color?: "gray" | "blue" | "green" | "pink" | "purple";
  /** 크기 — Badge/Chip과 동일 체계 (sm=20 / md=24 / lg=28). 기본 sm. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorStyles = {
  gray: "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)]",
  blue: "bg-[var(--color-bg-info)] text-[var(--color-brand-primary-hover)]",
  green: "bg-[var(--color-bg-success)] text-[var(--palette-success-700)]",
  pink: "bg-[var(--palette-tint-pink)] text-[var(--palette-tint-pink-text)]",
  purple: "bg-[var(--palette-tint-purple)] text-[var(--palette-tint-purple-text)]",
};

/* sm/md/lg — height + padding + text size 연동. text size는 토큰 스케일(12/14/16) 짝수만 사용.
   leading-none으로 폰트 메트릭 대칭. */
const sizeStyles = {
  sm: "h-5 px-2 text-[12px]",
  md: "h-6 px-2.5 text-[14px]",
  lg: "h-7 px-3 text-[14px]",
};

export function Tag({
  children,
  color = "gray",
  size = "sm",
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-normal leading-none font-[family-name:var(--font-primary)]",
        sizeStyles[size],
        colorStyles[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type { TagProps };
