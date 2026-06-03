import { cn } from "@/lib/cn";

interface ChipProps {
  children: React.ReactNode;
  variant?: "default" | "select";
  color?: "pink" | "blue" | "green" | "purple";
  /** 크기 — Tag/Badge와 동일 체계 (sm=20 / md=24 / lg=32). md 신규. 기본 sm. */
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const colorStyles = {
  pink: "bg-tint-pink",
  blue: "bg-tint-blue",
  green: "bg-tint-green",
  purple: "bg-tint-purple",
};

const sizeStyles = {
  sm: "h-[20px] px-[6px] text-[12px] tracking-[var(--tracking-xs)]",
  md: "h-[24px] px-[10px] text-[14px] tracking-[var(--tracking-xs)]",
  lg: "h-[32px] px-[12px] text-[16px] tracking-[var(--tracking-md)]",
};

export function Chip({
  children,
  variant = "default",
  color = "pink",
  size = "sm",
  onClick,
  className,
}: ChipProps) {
  const isSelect = variant === "select";
  const isClickable = !!onClick;

  return (
    <span
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "inline-flex items-center rounded-full font-normal transition-colors",
        isSelect ? colorStyles[color] : "bg-gray-200",
        isSelect ? "text-gray-700" : "text-gray-400",
        isClickable && "cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)] focus-visible:ring-offset-1",
        sizeStyles[size],
        className,
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
