import { cn } from "@/lib/cn";

interface ProgressBarProps {
  progress: number;
  width?: number;
  /** 스크린리더용 라벨 (기본 "진행률"). */
  label?: string;
  className?: string;
}

export function ProgressBar({ progress, width = 200, label = "진행률", className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1 rounded-full bg-[var(--color-bg-disabled)] relative", className)}
      style={{ width }}
    >
      <div
        className="absolute top-0 left-0 h-1 rounded-full bg-[var(--color-text-tertiary)]"
        style={{ width: `${clamped}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

export type { ProgressBarProps };
