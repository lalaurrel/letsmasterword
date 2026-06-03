import { cn } from "@/lib/cn";
import { Chip } from "@/lib/components/atoms/Chip/Chip";

type ChipColor = "pink" | "blue" | "green" | "purple";

interface Tag {
  name: string;
  color?: ChipColor;
}

interface TaskCardProps {
  title: string;
  tags?: Tag[];
  type?: 1 | 2 | 3;
  onEdit?: () => void;
  /** "default" = 회색 배경 + 라운드 / "embedded" = 외관 제거 (Widget 내부 중첩 시) */
  variant?: "default" | "embedded";
  className?: string;
}

const typeWidths = {
  1: "w-[108px]",
  2: "w-[217px]",
  3: "w-[325px]",
};

export function TaskCard({ title, tags = [], type, onEdit, variant = "default", className }: TaskCardProps) {
  const isEmbedded = variant === "embedded";
  return (
    <div
      className={cn(
        "group/task relative flex flex-col gap-1 px-2 py-1",
        !isEmbedded && "bg-gray-50 border-2 border-gray-50 rounded-xl",
        type && typeWidths[type],
        className,
      )}
    >
      {/* 편집 아이콘 — 호버 시 카드 우측 상단에 표시 */}
      {onEdit && (
        <button
          type="button"
          className="absolute -top-[4px] -right-[4px] w-5 h-5 rounded-full bg-white border border-[var(--color-border-default)] flex items-center justify-center opacity-0 group-hover/task:opacity-100 transition-opacity cursor-pointer z-10 hover:border-[var(--color-border-brand)] hover:bg-[var(--color-bg-accent-subtle)]"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M9.5 3.5l3 3M3 10l-0.5 3.5L6 13l7.5-7.5-3-3L3 10z"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <span className="text-[16px] font-normal text-gray-700 tracking-[var(--tracking-md)] line-clamp-1">
        {title}
      </span>
      {tags.length > 0 && (
        <div className="flex gap-1 flex-wrap overflow-hidden max-h-[20px]">
          {tags.map((tag) => (
            <Chip key={tag.name} variant="select" color={tag.color ?? "pink"} size="sm">
              {tag.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
