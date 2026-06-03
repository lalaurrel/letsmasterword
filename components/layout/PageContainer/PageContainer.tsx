import { cn } from "@/lib/cn";

interface PageContainerProps {
  /** 콘텐츠 max-width. 1440이 표준, 1280은 콘텐츠 폭만, "fluid"는 부모 폭. 기본 1440. */
  maxWidth?: 1280 | 1440 | "fluid";
  /** 페이지 padding 정책.
   *  - "page"    : px-80 py-stack-lg (어진님 view/home 표준)
   *  - "section" : px-32 py-stack-md (좁은 화면 / 보조 페이지)
   *  - "none"    : padding 없음 (자체 wrapper 사용 시)
   *  기본 "page". */
  padding?: "page" | "section" | "none";
  /** 페이지 배경 토큰. canvas=흰색 / surface=gray-50 (#F7F8FA, 어진님 표준) / subtle=gray-100. 기본 "surface". */
  background?: "canvas" | "surface" | "subtle";
  children: React.ReactNode;
  className?: string;
}

const widthClass = {
  1280: "w-[1280px]",
  1440: "w-[1440px]",
  fluid: "w-full",
} as const;

const paddingClass = {
  page: "px-[var(--space-scale-80)] py-[var(--space-layout-stack-lg)]",
  section: "px-[var(--space-scale-32)] py-[var(--space-layout-stack-md)]",
  none: "",
} as const;

const backgroundClass = {
  canvas: "bg-[var(--color-bg-canvas)]",
  surface: "bg-[var(--color-bg-surface)]",
  subtle: "bg-[var(--color-bg-subtle)]",
} as const;

/**
 * 페이지 wrapper primitive — viewport 중앙 정렬 + max-width + 페이지 padding + 배경 일괄.
 *
 * 사용처 코드의 다음 3종 박힌 px를 흡수:
 *   <div className="min-h-screen bg-[#f7f8fa] flex justify-center">  → background
 *   <div className="w-[1440px] flex-shrink-0">                       → maxWidth
 *   <div className="px-[80px] py-6">                                  → padding
 *
 * Navbar / Footer 등은 padding 안에 들어가지 않음 — 직접 children에 두면 padding 적용됨.
 * Navbar를 padding 밖으로 빼고 싶으면 padding="none"으로 두고 자체 wrap.
 */
export function PageContainer({
  maxWidth = 1440,
  padding = "page",
  background = "surface",
  children,
  className,
}: PageContainerProps) {
  /* min-h-screen + flex justify-center로 viewport 중앙 정렬 자동. */
  return (
    <div className={cn("min-h-screen flex justify-center", backgroundClass[background])}>
      <div className={cn(widthClass[maxWidth], "flex-shrink-0", paddingClass[padding], className)}>
        {children}
      </div>
    </div>
  );
}

export type { PageContainerProps };
