import { cn } from "@/lib/cn";
import { Avatar } from "@/lib/components/atoms/Avatar/Avatar";
import { StatusBadge } from "@/lib/components/atoms/StatusBadge/StatusBadge";

interface UpdateRowProps {
  time?: string;
  title: string;
  status: "informative" | "warning" | "success" | "error";
  avatarProfile?: 1 | 2 | 3 | 4 | 5;
  avatarSrc?: string;
  message: string;
  /** 최대 폭 (기본 "616px"). "100%"로 설정하면 부모 폭에 따름. */
  maxWidth?: string;
  /** "default" = 흰 배경 + 라운드 / "embedded" = 외관 제거 (UpdatesSection 내부 사용 시) */
  variant?: "default" | "embedded";
  onClick?: () => void;
  className?: string;
}

export function UpdateRow({
  time = "55m ago",
  title,
  status,
  avatarProfile = 1,
  avatarSrc,
  message,
  maxWidth = "616px",
  variant = "default",
  onClick,
  className,
}: UpdateRowProps) {
  const isEmbedded = variant === "embedded";
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
      style={{ maxWidth }}
      className={cn(
        "w-full h-[44px] flex items-center py-3 px-4",
        !isEmbedded && "rounded-[16px] bg-white",
        onClick && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)]",
        className,
      )}
    >
      {/* 584px inner: left(294) ↔ right(184). gap-lg(16) 최소 보장 + 여유 공간은 space-between으로. */}
      <div className="flex-1 flex items-center justify-between gap-[var(--space-layout-inline-lg)]">
        {/* Left: 294px fixed, [time+title](238) + badge, gap=16 space-between */}
        <div className="w-[294px] flex items-center justify-between flex-shrink-0">
          <div className="w-[238px] flex items-center gap-4 flex-shrink-0">
            <span className="w-[54px] text-[12px] font-normal text-[var(--color-text-disabled)] tracking-[-0.24px] leading-[16px] flex-shrink-0">
              {time}
            </span>
            <span className="flex-1 text-[16px] font-normal text-[var(--color-text-primary)] tracking-[-0.32px] leading-[20px] truncate">
              {title}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Right: 184px fixed, avatar + message(156), gap=8 */}
        <div className="w-[184px] flex items-center gap-2 justify-end flex-shrink-0">
          <Avatar profile={avatarProfile} src={avatarSrc} />
          <span className="w-[156px] text-[12px] font-normal text-[var(--color-text-tertiary)] tracking-[-0.24px] leading-[16px] truncate">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
