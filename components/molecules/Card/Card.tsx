import { cn } from "@/lib/cn";
import { Skeleton } from "@/lib/components/atoms/Skeleton/Skeleton";

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  thumbnail?: string;
  onClick?: () => void;
  /** "default" = 단독 카드 (border + 흰배경 + 호버 그림자) / "embedded" = 다른 카드 안에 들어갈 때 외관 제거 */
  variant?: "default" | "embedded";
  /** 로딩 상태 — Skeleton placeholder 표시 */
  loading?: boolean;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  thumbnail,
  onClick,
  variant = "default",
  loading = false,
  className,
}: CardProps) {
  const isEmbedded = variant === "embedded";

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="로딩 중"
        className={cn(
          "flex flex-col gap-3",
          !isEmbedded && "bg-white border border-[var(--color-border-subtle)] rounded-[20px] p-4",
          className,
        )}
      >
        <Skeleton height={140} radius="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex flex-col gap-3 transition-shadow duration-200",
        !isEmbedded && "bg-white border border-[var(--color-border-subtle)] rounded-[20px] p-4",
        !isEmbedded && onClick && "hover:shadow-[var(--shadow-elevation-mid)]",
        onClick && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)]",
        className,
      )}
    >
      {thumbnail && (
        <div className="aspect-[3/2] rounded-[12px] bg-[var(--color-bg-surface)] overflow-hidden">
          <img
            src={thumbnail}
            alt={title || ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && (
            <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-primary)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[length:var(--text-sm-alt)] text-[var(--color-text-tertiary)] font-[family-name:var(--font-primary)]">
              {description}
            </p>
          )}
        </div>
      )}

      {children && <div>{children}</div>}
    </div>
  );
}
