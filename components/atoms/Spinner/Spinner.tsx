import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  /** 스크린리더용 라벨 (기본 "로딩 중"). 시각적으로는 보이지 않음. */
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
};

export function Spinner({
  size = "md",
  color = "currentColor",
  label = "로딩 중",
  className,
}: SpinnerProps) {
  const s = sizeMap[size];

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
      className={cn("animate-spin", className)}
      style={{ animationDuration: "0.8s" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type { SpinnerProps };
