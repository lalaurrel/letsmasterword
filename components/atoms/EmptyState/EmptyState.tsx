import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/lib/components/atoms/Icon/Icon";

interface EmptyStateProps {
  /** 큰 제목 텍스트 */
  title: string;
  /** 보조 설명 텍스트 */
  description?: string;
  /** 상단 아이콘 이름 (Icon 컴포넌트 name 참조). 미지정 시 아이콘 영역 생략. */
  iconName?: IconName;
  /** 액션 버튼/링크 등 ReactNode (예: <Button>...</Button>) */
  action?: React.ReactNode;
  /** 패딩 크기 */
  size?: "sm" | "md" | "lg";
  /** 최대 폭 (기본 "100%") */
  maxWidth?: string;
  className?: string;
}

const sizeStyles = {
  sm: "py-6 gap-2",
  md: "py-10 gap-3",
  lg: "py-16 gap-4",
};

/* Icon 컴포넌트가 sm/md/lg 3단계만 지원하므로, EmptyState의 크기 변화는
   래퍼 원형(w-12/w-14/w-16)으로 표현하고 아이콘 자체는 lg(24)로 통일. */
const iconWrapperStyles = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const titleSizeStyles = {
  sm: "text-[14px]",
  md: "text-[16px]",
  lg: "text-[18px]",
};

export function EmptyState({
  title,
  description,
  iconName,
  action,
  size = "md",
  maxWidth = "100%",
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center px-4",
        sizeStyles[size],
        className,
      )}
      style={{ maxWidth, margin: "0 auto" }}
    >
      {iconName && (
        <div
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]",
            iconWrapperStyles[size],
          )}
        >
          <Icon name={iconName} size="lg" />
        </div>
      )}
      <p className={cn("font-medium text-[var(--color-text-primary)]", titleSizeStyles[size])}>
        {title}
      </p>
      {description && (
        <p className="text-[14px] text-[var(--color-text-secondary)] max-w-[320px]">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export type { EmptyStateProps };
