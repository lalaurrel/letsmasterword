"use client";

import { cn } from "@/lib/cn";
import { useId, useState } from "react";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[var(--color-bg-inverse)]",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[var(--color-bg-inverse)]",
  left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[var(--color-bg-inverse)]",
  right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[var(--color-bg-inverse)]",
};

export function Tooltip({
  content,
  position = "top",
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={() => setVisible(true)}
      onBlurCapture={() => setVisible(false)}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      <div
        role="tooltip"
        id={tooltipId}
        className={cn(
          "absolute z-50 whitespace-nowrap pointer-events-none transition-opacity duration-150",
          visible ? "opacity-100" : "opacity-0",
          positionStyles[position],
        )}
      >
        <div className="bg-[var(--color-bg-inverse)] text-white text-[12px] font-[family-name:var(--font-primary)] px-[10px] py-[6px] rounded-[8px]">
          {content}
        </div>
        <span
          className={cn(
            "absolute w-0 h-0 border-[6px]",
            arrowStyles[position],
          )}
        />
      </div>
    </div>
  );
}
