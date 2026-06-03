import { cn } from "@/lib/cn";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const radiusStyles = {
  sm: "rounded-[4px]",
  md: "rounded-[8px]",
  lg: "rounded-[12px]",
  full: "rounded-full",
};

export function Skeleton({
  width,
  height,
  radius = "md",
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-[var(--color-bg-subtle)] animate-shimmer",
        radiusStyles[radius],
        !width && "w-full",
        !height && "h-4",
        className,
      )}
      style={{
        ...(width ? { width: typeof width === "number" ? `${width}px` : width } : {}),
        ...(height ? { height: typeof height === "number" ? `${height}px` : height } : {}),
        backgroundImage: "linear-gradient(90deg, var(--color-bg-subtle) 0%, var(--color-bg-surface) 50%, var(--color-bg-subtle) 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export type { SkeletonProps };
