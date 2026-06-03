"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/components/atoms/Icon/Icon";

interface AccordionItem {
  title: string;
  content: string | React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
  className?: string;
}

export function Accordion({ items, defaultOpen, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpen !== undefined ? defaultOpen : null,
  );

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index} className="border-b border-[var(--color-border-subtle)]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => handleToggle(index)}
              className="flex items-center justify-between w-full py-4 cursor-pointer text-left"
            >
              <span className="text-[16px] font-medium text-[var(--color-text-primary)] font-[family-name:var(--font-primary)]">
                {item.title}
              </span>
              <div
                className={cn(
                  "flex-shrink-0 transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              >
                <Icon name="chevron-down" size="sm" color="var(--color-icon-secondary)" />
              </div>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <div className="pb-4 text-[14px] text-[var(--color-text-tertiary)] font-[family-name:var(--font-primary)] leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { AccordionItem, AccordionProps };
