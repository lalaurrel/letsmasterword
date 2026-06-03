import { cn } from "@/lib/cn";

type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface ColumnProps {
  /** 12-grid 컬럼 span (1~12). 폭 자동 계산 — size-scale skill 부록 A 매핑.
   *  Desktop 1440 / margin 80 / gutter 24 → 컨텐츠 1280 / 단일 컬럼 84.67px 기준. */
  span: ColumnSpan;
  /** 시맨틱 태그. 기본 div. */
  as?: "div" | "section" | "aside" | "main" | "article";
  children: React.ReactNode;
  className?: string;
}

/**
 * 12-grid 스냅 폭 (size-scale skill 부록 A).
 * col-N = N × 84.67 + (N-1) × 24 (gutter), 반올림.
 * col-4 / col-6 / col-8 / col-12는 시안의 실제 사용 너비.
 */
const COLUMN_WIDTH_PX: Record<ColumnSpan, number> = {
  1: 85,
  2: 193,
  3: 302,
  4: 411,
  5: 519,
  6: 628,
  7: 737,
  8: 845,
  9: 954,
  10: 1063,
  11: 1171,
  12: 1280,
};

/**
 * 12-grid 컬럼 primitive — span으로 폭 결정.
 *
 * 사용처 코드의 다음 패턴 흡수:
 *   style={{ width: 845 }} → <Column span={8}>
 *   style={{ width: 411 }} → <Column span={4}>
 *
 * 부모는 flex row + gap=layout-gutter (24px) 이어야 함. 곧 추가될 <Row> 컴포넌트가 흡수 예정 (2라운드).
 * Column 안에서 다시 Column 중첩은 금지 — 한 페이지 내 하나의 grid context만 허용.
 */
export function Column({ span, as: Tag = "div", children, className }: ColumnProps) {
  return (
    <Tag
      className={cn("flex-shrink-0", className)}
      style={{ width: COLUMN_WIDTH_PX[span] }}
      data-column-span={span}
    >
      {children}
    </Tag>
  );
}

export type { ColumnProps, ColumnSpan };
