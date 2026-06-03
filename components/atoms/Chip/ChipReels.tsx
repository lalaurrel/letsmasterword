"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Chip } from "./Chip";

type ChipColor = "pink" | "blue" | "green" | "purple";

interface ChipItem {
  name: string;
  color: ChipColor;
}

interface ChipReelsProps {
  items: ChipItem[];
  size?: "sm" | "lg";
  multiSelect?: boolean;
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  className?: string;
}

export function ChipReels({
  items,
  size = "lg",
  multiSelect = true,
  defaultSelected = [],
  onChange,
  className,
}: ChipReelsProps) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const handleClick = (name: string) => {
    let next: string[];
    if (multiSelect) {
      next = selected.includes(name)
        ? selected.filter((s) => s !== name)
        : [...selected, name];
    } else {
      next = selected.includes(name) ? [] : [name];
    }
    setSelected(next);
    onChange?.(next);
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {items.map((item) => (
        <Chip
          key={item.name}
          variant={selected.includes(item.name) ? "select" : "default"}
          color={item.color}
          size={size}
          onClick={() => handleClick(item.name)}
        >
          {item.name}
        </Chip>
      ))}
    </div>
  );
}

export type { ChipItem, ChipReelsProps };
