"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";

interface DatePickerProps {
  /** single mode (기본) — 단일 날짜 선택 */
  value?: string;
  onChange?: (date: string) => void;

  /** range mode — 시작일·종료일 선택 */
  mode?: "single" | "range";
  startDate?: string;
  endDate?: string;
  onChangeRange?: (range: { start: string; end: string }) => void;

  placeholder?: string;
  /** 필드 표시 포맷터. 기본: YYYY-MM-DD 그대로. */
  formatDisplay?: (date: string) => string;
  /** 최소 폭 — 종료일이 있는 경우 글자 잘림 방지. 기본: single=180px, range=280px. */
  minWidth?: string;
  /** 요일 약자 7개 (일~토 순서). 기본 ["일", "월", "화", "수", "목", "금", "토"]. */
  dayLabels?: readonly [string, string, string, string, string, string, string];
  className?: string;
}

const DEFAULT_DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function compareDate(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function DatePicker({
  value,
  onChange,
  mode = "single",
  startDate,
  endDate,
  onChangeRange,
  placeholder,
  formatDisplay = (d) => d,
  minWidth,
  dayLabels = DEFAULT_DAY_LABELS,
  className,
}: DatePickerProps) {
  const isRange = mode === "range";

  /* 기본값 자동 결정 — placeholder / minWidth */
  const resolvedPlaceholder =
    placeholder ?? (isRange ? "YYYY-MM-DD ~ YYYY-MM-DD" : "YYYY-MM-DD");
  const resolvedMinWidth = minWidth ?? (isRange ? "280px" : "180px");

  const [isOpen, setIsOpen] = useState(false);

  /* range mode 내부 임시 선택 상태 — 첫 클릭=start, 두번째=end */
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const initialDate = (isRange ? startDate : value) ?? "";
  const [viewYear, setViewYear] = useState(() => {
    if (initialDate) return parseInt(initialDate.split("-")[0]);
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (initialDate) return parseInt(initialDate.split("-")[1]) - 1;
    return new Date().getMonth();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setPendingStart(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const handleNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleSelectDate = useCallback(
    (day: number) => {
      const dateStr = toDateStr(viewYear, viewMonth, day);

      if (!isRange) {
        onChange?.(dateStr);
        setIsOpen(false);
        return;
      }

      /* range: 첫 클릭=start 임시 저장, 두번째 클릭=end 확정 */
      if (pendingStart === null) {
        setPendingStart(dateStr);
        return;
      }

      const [start, end] =
        compareDate(pendingStart, dateStr) <= 0
          ? [pendingStart, dateStr]
          : [dateStr, pendingStart];
      onChangeRange?.({ start, end });
      setPendingStart(null);
      setIsOpen(false);
    },
    [viewYear, viewMonth, isRange, pendingStart, onChange, onChangeRange],
  );

  /* 필드에 표시할 텍스트 결정 */
  const displayText = (() => {
    if (isRange) {
      if (startDate && endDate) {
        return `${formatDisplay(startDate)} ~ ${formatDisplay(endDate)}`;
      }
      return null;
    }
    return value ? formatDisplay(value) : null;
  })();

  /* range cell 시각 처리:
     - 시작/종료가 같은 cell이거나 single selected → 좌우 strip 없음 (circle만)
     - 시작 cell (start < end): 우측 half-strip만 painting → circle 오른쪽으로 strip 이어짐
     - 종료 cell: 좌측 half-strip만 painting
     - 중간 cell (start < dateStr < end): 좌·우 모두 painting = 가로 strip 연속
     - 행 경계는 grid 자체에서 자연스럽게 끊김 */
  const getCellMeta = (dateStr: string) => {
    let bgLeft = false;
    let bgRight = false;
    let isCircle: "selected" | "today" | null = null;
    let textTone: "white" | "primary" | "secondary" | "accent" = "secondary";

    const isToday = dateStr === todayStr;

    if (isRange) {
      const isStart = startDate === dateStr;
      const isEnd = endDate === dateStr;
      const isPending = pendingStart === dateStr;

      if (isPending) {
        isCircle = "selected";
        textTone = "white";
      } else if (startDate && endDate) {
        const isMiddle =
          compareDate(dateStr, startDate) > 0 && compareDate(dateStr, endDate) < 0;
        if (isStart) {
          isCircle = "selected";
          textTone = "white";
          if (startDate !== endDate) bgRight = true;
        } else if (isEnd) {
          isCircle = "selected";
          textTone = "white";
          if (startDate !== endDate) bgLeft = true;
        } else if (isMiddle) {
          bgLeft = true;
          bgRight = true;
          textTone = "primary";
        } else if (isToday) {
          textTone = "accent";
        }
      } else if (isToday) {
        textTone = "accent";
      }
    } else {
      if (dateStr === value) {
        isCircle = "selected";
        textTone = "white";
      } else if (isToday) {
        textTone = "accent";
      }
    }

    return { bgLeft, bgRight, isCircle, textTone, isToday };
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      style={{ minWidth: resolvedMinWidth }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={displayText ? `날짜: ${displayText}` : resolvedPlaceholder}
        className={cn(
          "flex items-center justify-between w-full h-[44px] px-4 border border-[var(--color-border-default)] rounded-[12px] bg-white text-left transition-colors cursor-pointer",
          "hover:border-[var(--color-border-hover)]",
          isOpen && "border-[var(--color-border-brand)]",
        )}
      >
        <span
          className={cn(
            "text-[14px] font-[family-name:var(--font-primary)] font-mono tracking-tight truncate",
            displayText ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-disabled)]",
          )}
        >
          {displayText ?? resolvedPlaceholder}
        </span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 ml-2" aria-hidden="true">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="var(--color-icon-secondary)" strokeWidth="1.33" />
          <path d="M3 8H17" stroke="var(--color-icon-secondary)" strokeWidth="1.33" />
          <path d="M7 2V5" stroke="var(--color-icon-secondary)" strokeWidth="1.33" strokeLinecap="round" />
          <path d="M13 2V5" stroke="var(--color-icon-secondary)" strokeWidth="1.33" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={isRange ? "기간 선택" : "날짜 선택"}
          className="absolute top-[48px] left-0 z-50 bg-white border border-[var(--color-border-subtle)] rounded-[16px] shadow-[var(--shadow-elevation-mid)] p-4 w-[280px] flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="이전 달"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-surface)] cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 14L8 10L12 6" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-[14px] font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-primary)]">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="다음 달"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-surface)] cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M8 6L12 10L8 14" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {isRange && pendingStart && (
            <div className="text-[length:var(--text-overline)] text-[var(--color-text-tertiary)] text-center">
              시작 {pendingStart} → 종료일을 선택하세요
            </div>
          )}

          <div className="grid grid-cols-7 gap-0">
            {dayLabels.map((day) => (
              <div
                key={day}
                className="text-center text-[12px] text-[var(--color-text-disabled)] font-medium font-[family-name:var(--font-primary)] py-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const { bgLeft, bgRight, isCircle, textTone } = getCellMeta(dateStr);

              return (
                <div key={day} className="relative h-8 flex items-center justify-center">
                  {/* range strip — 좌/우 절반씩 painting해서 연속 strip 구성.
                      행 경계는 grid 자체에서 자연스럽게 끊김. */}
                  {bgLeft && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 right-1/2 bg-[var(--color-bg-accent-subtle)]"
                    />
                  )}
                  {bgRight && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 left-1/2 right-0 bg-[var(--color-bg-accent-subtle)]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    aria-pressed={isCircle === "selected"}
                    className={cn(
                      "relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-[length:var(--text-sm-alt)] font-[family-name:var(--font-primary)] cursor-pointer transition-colors",
                      isCircle === "selected" && "bg-[var(--color-bg-inverse)]",
                      !isCircle && !bgLeft && !bgRight && "hover:bg-[var(--color-bg-surface)]",
                      textTone === "white" && "text-white",
                      textTone === "primary" && "text-[var(--color-text-primary)]",
                      textTone === "secondary" && "text-[var(--color-text-secondary)]",
                      textTone === "accent" && "text-[var(--color-text-accent)] font-medium",
                    )}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type { DatePickerProps };
