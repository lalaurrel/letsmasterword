import { cn } from "@/lib/cn";
import { Skeleton } from "@/lib/components/atoms/Skeleton/Skeleton";
import { resolveContainerWidth, type OrganismSize } from "@/lib/sizeScale";

interface ProgressItem {
  label: string;
  progress: number; // 0 ~ 100
}

interface CardData {
  school: string;
  type?: "S" | "M";
  items: ProgressItem[];
}

interface ProgressCardProps {
  cards: CardData[];
  /** 컨테이너 상단 섹션 제목 (선택). Widget 등에 중첩 시 외부에서 제어. */
  title?: string;
  /** "default" = 각 카드에 회색 배경 + 큰 라운드 / "embedded" = 외관 제거 (다른 카드 안에 중첩 시) */
  variant?: "default" | "embedded";
  /** 컨테이너 폭 — col 직결 6종 (size-scale §D). 지정 시 maxWidth보다 우선. */
  size?: OrganismSize;
  /** 최대 폭 (기본 "395px"). size 미지정 시 fallback. (레거시 — 신규는 size 권장) */
  maxWidth?: string;
  /** 로딩 상태 — Skeleton placeholder 표시 */
  loading?: boolean;
  /** cards가 비어있을 때 표시할 노드 (예: <EmptyState />) */
  emptyState?: React.ReactNode;
  className?: string;
}

function InCard({ school, type, items, embedded = false }: CardData & { embedded?: boolean }) {
  const percentage = items.length > 0
    ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length)
    : 0;

  const cardType = type ?? (school.length > 20 ? "M" : "S");
  const cardHeight = cardType === "M" ? 214 : 186;

  return (
    <div
      className={cn(
        "w-[348px] relative flex-shrink-0 overflow-hidden",
        !embedded && "rounded-[40px] bg-[var(--color-bg-subtle)]",
      )}
      style={{ height: cardHeight }}
    >
      {/* Frame 2147238326: 308px FIXED, left=24, top=20, gap=16 */}
      <div className="absolute top-5 left-6 w-[308px] flex flex-col gap-4">
        <span className="w-[308px] text-[24px] font-medium text-[var(--color-text-primary)] tracking-[-0.48px] leading-[32px] font-[family-name:var(--font-primary)]">
          {school}
        </span>
        {/* Frame 2147238325: 200px, gap=8 */}
        <div className="w-[200px] flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-[12px] font-normal text-[var(--color-text-secondary)] tracking-[-0.24px] leading-[18px]">
                {item.label}
              </span>
              <div className="w-[200px] h-1 rounded-full bg-[var(--color-bg-disabled)] relative">
                <div
                  className="absolute top-0 left-0 h-1 rounded-full bg-[var(--color-text-tertiary)]"
                  style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* percentnum: 우측 하단 */}
      <div className="absolute" style={{ right: 20, bottom: 8 }}>
        <div className="flex items-baseline">
          <span className="text-[68px] text-[var(--color-text-primary)] leading-[82px] tracking-[0px]" style={{ fontFamily: '"Urbanist", sans-serif', fontOpticalSizing: 'auto', fontWeight: 400, fontStyle: 'normal' }}>
            {percentage}
          </span>
          <span className="text-[14px] text-[var(--color-text-primary)] leading-[18px] ml-0.5" style={{ fontFamily: '"Urbanist", sans-serif', fontOpticalSizing: 'auto', fontWeight: 400, fontStyle: 'normal' }}>
            %
          </span>
        </div>
      </div>
    </div>
  );
}

export { InCard, type CardData, type ProgressItem };

export function ProgressCard({ cards, title, variant = "default", size, maxWidth = "395px", loading = false, emptyState, className }: ProgressCardProps) {
  const isEmbedded = variant === "embedded";
  const resolvedMaxWidth = resolveContainerWidth(size, maxWidth);
  return (
    <div style={{ maxWidth: resolvedMaxWidth }} className={cn("w-full flex flex-col gap-2", className)}>
      {title && (
        <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)] tracking-[-0.36px] font-[family-name:var(--font-primary)]">
          {title}
        </h2>
      )}
      {loading ? (
        <div role="status" aria-busy="true" aria-label="로딩 중" className="flex gap-2">
          <Skeleton width={348} height={186} radius="lg" />
        </div>
      ) : cards.length === 0 ? (
        <div className="flex items-center justify-center min-h-[120px]">
          {emptyState ?? (
            <span className="text-[length:var(--text-sm-alt)] text-[var(--color-text-tertiary)]">
              표시할 카드가 없습니다
            </span>
          )}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {cards.map((card, i) => (
            <InCard key={i} {...card} embedded={isEmbedded} />
          ))}
        </div>
      )}
    </div>
  );
}
