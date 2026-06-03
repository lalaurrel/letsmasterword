import { cn } from "@/lib/cn";

type StackGap = "xs" | "sm" | "md" | "lg" | "xl" | "gutter";
type StackAlign = "stretch" | "start" | "center" | "end";
type StackAs = "div" | "section" | "main" | "aside" | "article" | "ul" | "ol" | "nav" | "header" | "footer";

interface StackProps {
  /** layout-stack-* 토큰 매핑 (xs=4 / sm=8 / md=16 / lg=24 / xl=40 / gutter=24). 기본 "md". */
  gap?: StackGap;
  /** align-items. 기본 "stretch". */
  align?: StackAlign;
  /** 시맨틱 태그. 기본 div. */
  as?: StackAs;
  children: React.ReactNode;
  className?: string;
}

const GAP_CLASS: Record<StackGap, string> = {
  xs: "gap-[var(--space-layout-stack-xs)]",
  sm: "gap-[var(--space-layout-stack-sm)]",
  md: "gap-[var(--space-layout-stack-md)]",
  lg: "gap-[var(--space-layout-stack-lg)]",
  xl: "gap-[var(--space-layout-stack-xl)]",
  gutter: "gap-[var(--space-layout-gutter)]",
};

const ALIGN_CLASS: Record<StackAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

/**
 * 수직 배치 primitive — `flex flex-col gap-[layout-stack-*]` 패턴 흡수.
 *
 * 사용처 코드 흡수:
 *   <div className="flex flex-col gap-[var(--space-layout-stack-lg)]">
 *     → <Stack gap="lg">
 *
 * 토큰 매핑 (layout-stack-*):
 *   xs=4  | sm=8  | md=16 | lg=24 | xl=40 | gutter=24
 */
export function Stack({
  gap = "md",
  align = "stretch",
  as: Tag = "div",
  children,
  className,
}: StackProps) {
  return (
    <Tag className={cn("flex flex-col", GAP_CLASS[gap], ALIGN_CLASS[align], className)}>
      {children}
    </Tag>
  );
}

export type { StackProps, StackGap, StackAlign };
