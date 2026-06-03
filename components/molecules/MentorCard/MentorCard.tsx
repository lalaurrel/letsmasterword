import { cn } from "@/lib/cn";
import { Avatar } from "@/lib/components/atoms/Avatar/Avatar";
import { Tag } from "@/lib/components/atoms/Tag/Tag";
import { Skeleton } from "@/lib/components/atoms/Skeleton/Skeleton";
import { Icon } from "@/lib/components/atoms/Icon/Icon";

/**
 * 멘토 상태 — 매칭 여부 + 가용성을 동시 표현.
 *  - available : 매칭 가능 (초록 dot + label)
 *  - away      : 일시 부재 (회색 dot + label, hover/click 무력화는 호출측 결정)
 *  - pending   : 매칭 신청 진행 중 (Spinner 같은 작은 indicator + label)
 *  - matched   : 이미 매칭된 멘토 ("매칭됨" 라벨)
 *  - none      : 표시 없음 (기본)
 */
type MentorStatus = "none" | "available" | "away" | "pending" | "matched";

interface MentorCardProps {
  name?: string;
  school?: string;
  major?: string;
  avatarProfile?: 1 | 2 | 3 | 4 | 5;
  avatarSrc?: string;
  tags?: string[];
  rating?: number;
  /** 호환용 — true면 status="available"과 동일 동작. status가 있으면 무시. */
  available?: boolean;
  /** 멘토 상태 (status가 모든 가용성 표현. available은 레거시) */
  status?: MentorStatus;
  /** status별 라벨 일괄 커스터마이즈. 미지정 시 한국어 기본값. */
  statusLabel?: Partial<Record<Exclude<MentorStatus, "none">, string>>;
  /** 다음 세션 정보 (예: "내일 오후 3시"). 표시되면 카드 하단에 1줄 추가. */
  nextSessionLabel?: string;
  /** 미확인 메시지 수. 1 이상이면 경고 톤 노출. 100+ 시 자동 "99+" 표기. */
  unreadCount?: number;
  onClick?: () => void;
  /** "default" = 단독 카드 (border + 흰배경 + 호버 그림자) / "embedded" = 다른 카드 안에 들어갈 때 (외관 제거) */
  variant?: "default" | "embedded";
  /** 선택 상태 (default variant 전용). true면 brand 테두리(2px) + 강조 배경 + 체크.
   *  결제 수단 선택처럼 여러 카드 중 현재 선택된 하나를 명시. additive (기본 false). */
  selected?: boolean;
  /** 로딩 상태 — Skeleton placeholder 표시 */
  loading?: boolean;
  className?: string;
}

const DEFAULT_STATUS_LABEL: Record<Exclude<MentorStatus, "none">, string> = {
  available: "Available",
  away: "휴가 중",
  pending: "신청 진행 중",
  matched: "매칭됨",
};

const STATUS_DOT_COLOR: Record<Exclude<MentorStatus, "none">, string> = {
  available: "bg-[var(--color-text-success)]",
  away: "bg-[var(--color-text-disabled)]",
  pending: "bg-[var(--color-text-warning)]",
  matched: "bg-[var(--color-text-accent)]",
};

const STATUS_TEXT_COLOR: Record<Exclude<MentorStatus, "none">, string> = {
  available: "text-[var(--color-text-success)]",
  away: "text-[var(--color-text-tertiary)]",
  pending: "text-[var(--color-text-warning)]",
  matched: "text-[var(--color-text-accent)]",
};

function StarRating({ rating = 0 }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1.5L8.54 4.64L12 5.14L9.5 7.58L10.08 11.02L7 9.4L3.92 11.02L4.5 7.58L2 5.14L5.46 4.64L7 1.5Z"
            fill={i < Math.round(rating) ? "var(--color-text-warning)" : "var(--color-bg-subtle)"}
          />
        </svg>
      ))}
    </div>
  );
}

export function MentorCard({
  name,
  school,
  major,
  avatarProfile = 1,
  avatarSrc,
  tags = [],
  rating = 0,
  available = false,
  status,
  statusLabel,
  nextSessionLabel,
  unreadCount = 0,
  onClick,
  variant = "default",
  selected = false,
  loading = false,
  className,
}: MentorCardProps) {
  const isEmbedded = variant === "embedded";
  const isSelected = selected && !isEmbedded;

  /* 호환: available=true → status="available" (status 미지정 시) */
  const resolvedStatus: MentorStatus =
    status ?? (available ? "available" : "none");

  const labels = { ...DEFAULT_STATUS_LABEL, ...statusLabel };

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="로딩 중"
        className={cn(
          "flex flex-col gap-3",
          !isEmbedded && "bg-white border border-[var(--color-border-subtle)] rounded-[20px] p-5",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <Skeleton width={48} height={48} radius="full" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton width="60%" height={16} />
            <Skeleton width="80%" height={12} />
          </div>
        </div>
        <div className="flex gap-1.5">
          <Skeleton width={60} height={20} radius="md" />
          <Skeleton width={70} height={20} radius="md" />
        </div>
      </div>
    );
  }

  const showStatus = resolvedStatus !== "none";
  const isInteractive = Boolean(onClick) && resolvedStatus !== "away";

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? "button" : "article"}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `${name} 멘토 카드` : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      aria-selected={isSelected || undefined}
      className={cn(
        "relative flex flex-col gap-3 transition-shadow duration-200",
        !isEmbedded && "rounded-[20px] p-5",
        !isEmbedded && !isSelected && "bg-white border border-[var(--color-border-subtle)]",
        !isEmbedded && isSelected && "bg-[var(--color-bg-accent-subtle)] border-2 border-[var(--color-border-brand)]",
        !isEmbedded && isInteractive && "hover:shadow-[var(--shadow-elevation-mid)]",
        isInteractive && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)]",
        resolvedStatus === "away" && "opacity-60",
        className,
      )}
    >
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--color-border-brand)] flex items-center justify-center"
        >
          <Icon name="check" size="sm" color="var(--color-text-inverse)" />
        </span>
      )}
      <div className="flex items-start gap-3">
        <Avatar
          profile={avatarProfile}
          src={avatarSrc}
          alt={name}
          size="lg"
        />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-primary)]">
              {name}
            </span>
            {showStatus && (
              <span className="inline-flex items-center gap-1">
                <span className={cn("w-[6px] h-[6px] rounded-full", STATUS_DOT_COLOR[resolvedStatus])} />
                <span className={cn("text-[12px] font-[family-name:var(--font-primary)]", STATUS_TEXT_COLOR[resolvedStatus])}>
                  {labels[resolvedStatus]}
                </span>
              </span>
            )}
          </div>
          <p className="text-[length:var(--text-sm-alt)] text-[var(--color-text-tertiary)] font-[family-name:var(--font-primary)]">
            {school}
            {major && ` · ${major}`}
          </p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Tag key={tag} color="gray">
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {rating > 0 && (
        <StarRating rating={rating} />
      )}

      {(nextSessionLabel || unreadCount > 0) && (
        <div className="flex flex-col gap-1 pt-1">
          {nextSessionLabel && (
            <span className="text-[length:var(--text-sm-alt)] text-[var(--color-text-secondary)]">
              다음 세션 {nextSessionLabel}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="text-[12px] text-[var(--color-text-warning)]">
              메시지 {unreadCount > 99 ? "99+" : unreadCount}개 미확인
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export type { MentorCardProps, MentorStatus };
