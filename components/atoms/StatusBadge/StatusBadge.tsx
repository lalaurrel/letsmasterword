import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status: "informative" | "warning" | "success" | "error";
  /** 직접 표시할 라벨 (예: "확인됨", "Approved"). 미지정 시 status에 따른 기본 라벨 사용. */
  label?: string;
  /** status → 라벨 일괄 매핑 커스터마이즈 (예: { success: "완료" }). label prop이 더 우선. */
  labelMap?: Partial<Record<StatusBadgeProps["status"], string>>;
  /** 크기 — Tag/Chip과 동일 체계 (sm=20 / md=24 / lg=28). 기본 sm. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusStyles = {
  informative: "bg-[var(--color-bg-info)] text-[var(--color-text-info)]",
  warning: "bg-[var(--color-bg-warning)] text-[var(--color-text-warning)]",
  success: "bg-[var(--color-bg-success)] text-[var(--color-text-success)]",
  error: "bg-[var(--color-bg-error)] text-[var(--color-text-error)]",
};

const DEFAULT_LABELS: Record<StatusBadgeProps["status"], string> = {
  informative: "NOTI",
  warning: "WARN",
  success: "ACPT",
  error: "DEN",
};

/* Overline 스케일 — sm은 overline 토큰값(11px) 사용, md/lg는 짝수 스케일(12/14).
   sm height + min-w + padding + text size. leading-none 대칭. */
const sizeStyles = {
  sm: "h-5 min-w-[44px] px-2 text-[length:var(--text-overline)]",
  md: "h-6 min-w-[52px] px-2.5 text-[12px]",
  lg: "h-7 min-w-[60px] px-3 text-[14px]",
};

export function StatusBadge({ status, label, labelMap, size = "sm", className }: StatusBadgeProps) {
  const resolvedLabel = label ?? labelMap?.[status] ?? DEFAULT_LABELS[status];
  return (
    <span
      role="status"
      aria-label={`${status}: ${resolvedLabel}`}
      className={cn(
        /* Overline 정책 (uppercase 약어): weight 600 / tracking +0.5 / leading-none.
           leading-none + items-center → 폰트 메트릭 대칭 (uppercase descender 없는 글자 대응). */
        "inline-flex items-center justify-center rounded-[var(--radius-interactive-xs)] font-semibold tracking-[0.5px] leading-none",
        sizeStyles[size],
        statusStyles[status],
        className,
      )}
    >
      {resolvedLabel}
    </span>
  );
}

export type { StatusBadgeProps };
