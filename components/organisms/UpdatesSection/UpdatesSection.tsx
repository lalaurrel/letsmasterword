"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { StatusBadge } from "@/lib/components/atoms/StatusBadge/StatusBadge";
import { Icon } from "@/lib/components/atoms/Icon/Icon";
import { Skeleton } from "@/lib/components/atoms/Skeleton/Skeleton";
import { resolveContainerWidth, type OrganismSize } from "@/lib/sizeScale";

interface UpdateItem {
  time: string;
  title: string;
  status: "informative" | "warning" | "success" | "error";
  avatarProfile?: 1 | 2 | 3 | 4 | 5;
  message: string;
}

interface UpdatesSectionProps {
  showItem?: 1 | 2 | 3;
  items?: UpdateItem[];
  /** 섹션 제목 (기본 "Activity"). 캘린더뷰 등에서 다른 제목 사용 가능. */
  title?: string;
  /** 컨테이너 폭 — col 직결 6종 (size-scale §D). 지정 시 maxWidth보다 우선. */
  size?: OrganismSize;
  /** 최대 폭 (기본 "628px" = col-6). size 미지정 시 fallback. (레거시 — 신규는 size 권장) */
  maxWidth?: string;
  /** 로딩 상태 — Skeleton placeholder 표시 */
  loading?: boolean;
  /** items가 비어있을 때 표시할 노드 (예: <EmptyState />) */
  emptyState?: React.ReactNode;
  className?: string;
}

const ROW_HEIGHT = 52;
const ROW_GAP = 0;
const SCROLLBAR_WIDTH = 4;

export function UpdatesSection({
  showItem = 3,
  items = [],
  title = "Activity",
  size,
  maxWidth = "628px",
  loading = false,
  emptyState,
  className,
}: UpdatesSectionProps) {
  const resolvedMaxWidth = resolveContainerWidth(size, maxWidth);
  const viewportHeight = showItem * ROW_HEIGHT + Math.max(0, showItem - 1) * ROW_GAP;
  const contentHeight = items.length * ROW_HEIGHT + Math.max(0, items.length - 1) * ROW_GAP;
  const canScroll = contentHeight > viewportHeight;
  const maxScroll = Math.max(0, contentHeight - viewportHeight);

  const [scrollTop, setScrollTop] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const thumbHeight = canScroll ? Math.max(20, (viewportHeight / contentHeight) * viewportHeight) : 0;
  const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * (viewportHeight - thumbHeight) : 0;

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!canScroll) return;
      e.stopPropagation();
      setScrollTop((prev) => Math.max(0, Math.min(maxScroll, prev + e.deltaY)));
    },
    [canScroll, maxScroll],
  );

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartScroll.current = scrollTop;
    },
    [scrollTop],
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dy = e.clientY - dragStartY.current;
      const scrollRatio = dy / (viewportHeight - thumbHeight);
      setScrollTop(Math.max(0, Math.min(maxScroll, dragStartScroll.current + scrollRatio * maxScroll)));
    };
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [maxScroll, viewportHeight, thumbHeight]);

  return (
    <div
      style={{ maxWidth: resolvedMaxWidth }}
      className={cn(
        "w-full h-[224px] pt-5 pb-2 px-2 rounded-[48px] bg-[var(--color-bg-subtle)] flex flex-col gap-[10px] overflow-hidden",
        className,
      )}
    >
      <div className="px-6 flex items-center justify-between flex-shrink-0">
        <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3125px] leading-[36px]">
          {title}
        </h2>
        <button className="w-9 h-9 flex items-center justify-center rounded-[20px] bg-[var(--color-bg-surface)] cursor-pointer">
          <Icon name="plus" size="lg" color="var(--color-icon-secondary)" />
        </button>
      </div>

      <div
        className="relative flex-1 rounded-[40px] bg-white p-3 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={handleWheel}
      >
        {loading ? (
          <div role="status" aria-busy="true" aria-label="로딩 중" className="flex flex-col gap-3 p-2">
            {Array.from({ length: showItem }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1" style={{ height: ROW_HEIGHT - 8 }}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={11} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            {emptyState ?? (
              <span className="text-[length:var(--text-sm-alt)] text-[var(--color-text-tertiary)]">
                표시할 항목이 없습니다
              </span>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-x-3 top-3"
            style={{ top: 12 - scrollTop }}
          >
            {items.map((item, i) => (
                <div key={i}>
                  {i > 0 && <div className="h-px bg-[var(--color-bg-subtle)] mx-1" />}
                  <div className="flex items-center gap-3 px-2 py-2.5 cursor-pointer transition-opacity hover:opacity-70" style={{ height: ROW_HEIGHT }}>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-primary)] truncate">{item.title}</span>
                        <StatusBadge status={item.status} />
                        <span className="text-[10px] text-[var(--color-text-disabled)] flex-shrink-0 ml-auto">{item.time}</span>
                      </div>
                      <p className="text-[length:var(--text-overline)] text-[var(--color-text-tertiary)] truncate">{item.message}</p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}

        {/* Scrollbar */}
        {canScroll && (
          <div
            className={cn(
              "absolute right-1.5 top-3 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            style={{ width: SCROLLBAR_WIDTH, height: viewportHeight - 24 }}
          >
            <div className="absolute inset-0 rounded-full bg-[var(--color-bg-disabled)]" />
            <div
              className="absolute rounded-full bg-[var(--color-text-disabled)] hover:bg-[var(--color-text-tertiary)] cursor-grab active:cursor-grabbing transition-colors"
              style={{ top: thumbTop, width: SCROLLBAR_WIDTH, height: thumbHeight }}
              onMouseDown={handleThumbMouseDown}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export type { UpdateItem, UpdatesSectionProps };
