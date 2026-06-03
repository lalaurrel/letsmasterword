"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Chip } from "@/lib/components/atoms/Chip/Chip";
import { InCard } from "@/lib/components/molecules/ProgressCard/ProgressCard";
import { Icon } from "@/lib/components/atoms/Icon/Icon";
import { resolveContainerWidth, type OrganismSize } from "@/lib/sizeScale";

type ChipColor = "pink" | "blue" | "green" | "purple";

interface ProgressItem {
  label: string;
  progress: number;
}

interface SchoolCard {
  chipName: string;
  chipColor: ChipColor;
  school: string;
  type?: "S" | "M";
  items: ProgressItem[];
}

interface OverviewSectionProps {
  schools: SchoolCard[];
  /** 섹션 제목 (기본 "Overview"). 다른 화면에서 재사용 시 외부 제어. */
  title?: string;
  /** 컨테이너 폭 — col 직결 6종 (size-scale §D). col4(411)/col6(628)/col8(845)/col12/auto/full.
   *  지정 시 maxWidth보다 우선. 미지정 시 maxWidth 사용 (기존 호출처 호환). */
  size?: OrganismSize;
  /** 최대 폭 (기본 "411px"). size 미지정 시 fallback. (레거시 — 신규는 size 권장) */
  maxWidth?: string;
  /** 활용 모드.
   *  - "compact" (기본): 사이드바 위젯용 — 411×788 fixed, 내부 카드 347px fixed.
   *  - "fluid"         : 메인/풀폭 컨테이너용 — 부모 폭 fit (maxWidth 명시 권장), 높이 auto, 내부 카드 100%.
   *  Additive (rebase-safe): 기존 호출처는 기본 "compact"로 동작 동일. */
  layout?: "compact" | "fluid";
  /** 높이 정책 (additive).
   *  - "fixed" (기본): compact=788px / fluid=auto
   *  - "fill"        : 부모 높이에 맞춰 h-full. P1 좌우 컬럼 바텀 정렬용 — 부모 Column이 stretch여야 함.
   *  (view/home의 `!h-auto flex-1` override를 prop으로 정식화) */
  height?: "fixed" | "fill";
  className?: string;
}

const CARD_W = 348;
const CARD_GAP = 8;
const CARD_STEP = CARD_W + CARD_GAP;

export function OverviewSection({
  schools,
  title = "Overview",
  size,
  maxWidth = "411px",
  layout = "compact",
  height = "fixed",
  className,
}: OverviewSectionProps) {
  const resolvedMaxWidth = resolveContainerWidth(size, maxWidth);
  const isFluid = layout === "fluid";
  const isFill = height === "fill";
  const outerHeight = isFill ? "h-full" : isFluid ? "h-auto" : "h-[788px]";
  const innerHeight = isFill ? "h-full" : isFluid ? "h-auto" : "h-[760px]";
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleChipClick = (chipName: string) => {
    const index = schools.findIndex((s) => s.chipName === chipName);
    if (index !== -1) setSelectedIndex(index);
  };

  const totalWidth = schools.length * CARD_W + (schools.length - 1) * CARD_GAP;
  const translateX = -(selectedIndex * CARD_STEP);

  const dragRef = useRef<{ startX: number; dragging: boolean }>({ startX: 0, dragging: false });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, dragging: true };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(dx) < 30) return;
    if (dx < 0 && selectedIndex < schools.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (dx > 0 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex, schools.length]);

  return (
    <div
      style={{ maxWidth: resolvedMaxWidth }}
      className={cn(
        "w-full pt-5 pb-2 px-8 rounded-[48px] bg-white flex flex-col gap-[10px] overflow-hidden",
        outerHeight,
        className,
      )}
    >
      <div className={cn("w-full flex flex-col gap-[10px]", innerHeight)}>
        <div className="w-full h-[84px] flex flex-col gap-4 flex-shrink-0">
          <div className="w-full h-[36px] flex items-center justify-between">
            <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3125px] leading-[36px]">
              {title}
            </h2>
            <button className="w-9 h-9 flex items-center justify-center rounded-[20px] bg-[var(--color-bg-surface)] cursor-pointer">
              <Icon name="plus" size="lg" color="var(--color-icon-secondary)" />
            </button>
          </div>

          <div className="flex gap-1">
            {schools.map((s, i) => (
              <Chip
                key={s.chipName}
                variant={selectedIndex === i ? "select" : "default"}
                color={s.chipColor}
                size="lg"
                onClick={() => handleChipClick(s.chipName)}
              >
                {s.chipName}
              </Chip>
            ))}
          </div>
        </div>

        {!isFluid && <div className="w-[347px] flex-1 rounded-[20px] bg-white" />}

        <div
          className={cn(
            "h-[214px] flex-shrink-0 overflow-hidden cursor-grab active:cursor-grabbing",
            isFluid ? "w-full" : "w-[347px] overflow-visible",
          )}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div
            className="flex h-[214px] items-end"
            style={{
              width: totalWidth,
              gap: CARD_GAP,
              transform: `translateX(${translateX}px)`,
              transition: "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {schools.map((s) => (
              <InCard key={s.chipName} school={s.school} type={s.type} items={s.items} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
