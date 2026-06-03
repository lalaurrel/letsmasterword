import { cn } from "@/lib/cn";

type InlineGap = "xs" | "sm" | "md" | "lg" | "xl" | "gutter";
type InlineAlign = "stretch" | "start" | "center" | "end" | "baseline";
type InlineJustify = "start" | "center" | "end" | "between" | "around";
type InlineAs = "div" | "nav" | "ul" | "ol" | "header" | "footer" | "section";

interface InlineProps {
  /** layout-inline-* 토큰 매핑 (xs=4 / sm=8 / md=12 / lg=16 / xl=24 / gutter=24). 기본 "sm". */
  gap?: InlineGap;
  /** align-items. 기본 "center". */
  align?: InlineAlign;
  /** justify-content. 기본 "start". */
  justify?: InlineJustify;
  /** wrap 허용. 기본 false. */
  wrap?: boolean;
  /** 시맨틱 태그. 기본 div. */
  as?: InlineAs;
  children: React.ReactNode;
  className?: string;
}

const GAP_CLASS: Record<InlineGap, string> = {
  xs: "gap-[var(--space-layout-inline-xs)]",
  sm: "gap-[var(--space-layout-inline-sm)]",
  md: "gap-[var(--space-layout-inline-md)]",
  lg: "gap-[var(--space-layout-inline-lg)]",
  xl: "gap-[var(--space-layout-inline-xl)]",
  gutter: "gap-[var(--space-layout-gutter)]",
};

const ALIGN_CLASS: Record<InlineAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};

const JUSTIFY_CLASS: Record<InlineJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

/**
 * 수평 배치 primitive — `flex flex-row gap-[layout-inline-*]` 패턴 흡수.
 *
 * 사용처 코드 흡수:
 *   <div className="flex items-center gap-[var(--space-comp-gap-icon-label)]">
 *     → <Inline gap="sm">  (단 sm은 8, comp-gap-icon-label도 8이라 등가)
 *   <div className="flex gap-[var(--space-layout-gutter)]">
 *     → <Inline gap="gutter">
 *
 * 토큰 매핑 (layout-inline-*):
 *   xs=4 | sm=8 | md=12 | lg=16 | xl=24 | gutter=24
 *
 * 주의: stack과 토큰 단계가 다름 (md=12 vs stack-md=16) — 가로 짝 위젯과 세로 콘텐츠 블록의 의도 분리.
 */
export function Inline({
  gap = "sm",
  align = "center",
  justify = "start",
  wrap = false,
  as: Tag = "div",
  children,
  className,
}: InlineProps) {
  return (
    <Tag
      className={cn(
        "flex flex-row",
        wrap && "flex-wrap",
        GAP_CLASS[gap],
        ALIGN_CLASS[align],
        JUSTIFY_CLASS[justify],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export type { InlineProps, InlineGap, InlineAlign, InlineJustify };
