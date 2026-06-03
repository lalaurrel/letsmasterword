import { cn } from "@/lib/cn";
import { Icon } from "@/lib/components/atoms/Icon/Icon";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  showSeeMore?: boolean;
  /** true면 외관(흰배경/그림자/큰 라운드/패딩) 제거. 다른 Widget이나 Card 안에 중첩될 때 사용. */
  embedded?: boolean;
  className?: string;
}

export function Widget({
  title,
  children,
  showSeeMore = false,
  embedded = false,
  className,
}: WidgetProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        !embedded && "bg-white rounded-[48px] pt-5 pr-8 pb-2 pl-8 shadow-[var(--shadow-section-md)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3125px]">
          {title}
        </h2>
        {showSeeMore && (
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] cursor-pointer flex-shrink-0 transition-colors">
            <Icon name="seemore" size="sm" />
          </button>
        )}
      </div>
      {/* Children slot area */}
      <div>
        {children}
      </div>
    </div>
  );
}

export type { WidgetProps };
