import { cn } from "@/lib/cn";

interface DividerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-px",
  md: "h-[2px]",
  lg: "h-[4px]",
};

export function Divider({ size = "sm", className }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("w-full bg-[var(--color-border-subtle)]", sizeStyles[size], className)}
    />
  );
}

export type { DividerProps };
