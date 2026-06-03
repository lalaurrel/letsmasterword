"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";
import { TaskCard } from "@/lib/components/molecules/TaskCard/TaskCard";
import { Icon } from "@/lib/components/atoms/Icon/Icon";
import { Modal } from "@/lib/components/molecules/Modal/Modal";
import { TextField } from "@/lib/components/atoms/TextField/TextField";
import { Button } from "@/lib/components/atoms/Button/Button";
import { ChipReels } from "@/lib/components/atoms/Chip/ChipReels";
import { Dropdown } from "@/lib/components/molecules/Dropdown/Dropdown";

type ChipColor = "pink" | "blue" | "green" | "purple";

interface TaskTag {
  name: string;
  color?: ChipColor;
}

interface Task {
  title: string;
  tags: TaskTag[];
  dayIndex: number;
  row?: number;
  colSpan?: number;
  description?: string;
  tutor?: string;
}

interface WBSCalendarProps {
  /** type 1: Home 위젯 (845×460, 타이틀 "WBS") / type 2: Calendar 전용 (풀폭, 월 표기, 오늘 강조) */
  type?: 1 | 2;
  weekStart?: string;
  month?: string;
  year?: string;
  today?: number;
  tasks?: Task[];
  totalDays?: number;
  /** 캘린더 전체를 클릭 가능하게 만듭니다 (예: 상세 페이지로 이동) */
  onClick?: () => void;
  /** 최대 폭 (기본 type 1: "845px", type 2: "100%"). 다른 레이아웃에서 폭 조정 시 사용. */
  maxWidth?: string;
  /** type 1 위젯 모드의 제목 (기본 "WBS"). type 2에서는 사용 안 됨 (month·year 자동 표시). */
  title?: string;
  /** 편집 모달 + 알림 라벨 일괄 커스터마이즈 (기본 한국어). */
  labels?: WBSCalendarLabels;
  className?: string;
}

export interface WBSCalendarLabels {
  modalEditTitle?: string;
  modalAddTitle?: string;
  fieldTitle?: string;
  fieldTitlePlaceholder?: string;
  fieldSchool?: string;
  fieldDescription?: string;
  fieldDescriptionPlaceholder?: string;
  fieldOwner?: string;
  fieldStartDate?: string;
  fieldEndDate?: string;
  yearSuffix?: string;
  monthSuffix?: string;
  daySuffix?: string;
  deleteButton?: string;
  cancelButton?: string;
  saveButton?: string;
  conflictAlert?: string;
}

const DEFAULT_LABELS: Required<WBSCalendarLabels> = {
  modalEditTitle: "일정 편집",
  modalAddTitle: "일정 추가",
  fieldTitle: "일정 제목",
  fieldTitlePlaceholder: "일정 제목을 입력하세요",
  fieldSchool: "관련 학교",
  fieldDescription: "세부 설명",
  fieldDescriptionPlaceholder: "세부 설명을 입력하세요",
  fieldOwner: "담당자 (튜터)",
  fieldStartDate: "시작일",
  fieldEndDate: "종료일",
  yearSuffix: "년",
  monthSuffix: "월",
  daySuffix: "일",
  deleteButton: "삭제",
  cancelButton: "취소",
  saveButton: "저장",
  conflictAlert: "해당 일자에 이미 일정이 있어 변경이 어렵습니다.",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ALL_SCHOOL_CHIPS = [
  { name: "RISD", color: "pink" as ChipColor },
  { name: "RCA", color: "blue" as ChipColor },
  { name: "CMU", color: "green" as ChipColor },
  { name: "KU", color: "purple" as ChipColor },
];

// Dropdown 옵션
const YEAR_OPTIONS = [{ label: "2025", value: "2025" }, { label: "2026", value: "2026" }, { label: "2027", value: "2027" }];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월`, value: String(i + 1) }));
const DAY_31_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}일`, value: String(i + 1) }));
const TUTOR_OPTIONS = [
  { label: "Sarah Kim", value: "Sarah Kim" },
  { label: "James Park", value: "James Park" },
  { label: "Yuna Lee", value: "Yuna Lee" },
  { label: "David Oh", value: "David Oh" },
  { label: "Mina Choi", value: "Mina Choi" },
  { label: "Alex Jung", value: "Alex Jung" },
];

// 공통 그리드 상수
const COL_WIDTH = 108;
const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 60;
const SCROLLBAR_HEIGHT = 6;
const PAD_X = 44;
const EDGE_ZONE = 10; // 리사이즈 커서 감지 범위 (px)

// type별 규격
const TYPE_CONFIG = {
  1: { visibleWidth: 829, bodyHeight: 380, outerW: "w-[845px]", outerH: "h-[460px]" },
  2: { visibleWidth: 1080, bodyHeight: 520, outerW: "w-full", outerH: "h-[600px]" },
} as const;

// 내부 task 타입 (위치값 포함)
interface InternalTask extends Task {
  left: number;
  width: number;
  top: number;
}

// 행 인덱스 계산
function getRowIndex(top: number): number {
  return Math.round((top - HEADER_HEIGHT - 10) / ROW_HEIGHT);
}

// 충돌 감지: 같은 행에서 가로 범위 겹침
function checkCollision(
  left: number, width: number, top: number,
  tasks: InternalTask[], excludeIndex: number,
): boolean {
  const row = getRowIndex(top);
  const right = left + width;
  return tasks.some((t, i) => {
    if (i === excludeIndex) return false;
    const tRow = getRowIndex(t.top);
    if (tRow !== row) return false;
    const tRight = t.left + t.width;
    return left < tRight && right > t.left;
  });
}

export function WBSCalendar({
  type = 1,
  weekStart = "19",
  month = "April",
  year = "2026",
  today,
  tasks: initialTasks = [],
  totalDays = 14,
  onClick,
  maxWidth,
  title = "WBS",
  labels: labelsProp,
  className,
}: WBSCalendarProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const cfg = TYPE_CONFIG[type];
  const startDate = Number(weekStart);

  const contentWidth = PAD_X * 2 + totalDays * COL_WIDTH;
  const snapLines = Array.from({ length: totalDays + 1 }, (_, i) => PAD_X + i * COL_WIDTH);

  function snapToLine(x: number): number {
    let closest = snapLines[0];
    let minDist = Math.abs(x - closest);
    for (const line of snapLines) {
      const dist = Math.abs(x - line);
      if (dist < minDist) { minDist = dist; closest = line; }
    }
    return closest;
  }


  const dates = Array.from({ length: totalDays }, (_, i) => ({
    day: DAY_NAMES[(i) % 7],
    date: startDate + i,
  }));

  const [tasks, setTasks] = useState<InternalTask[]>(
    initialTasks.map((t) => ({
      ...t,
      left: PAD_X + t.dayIndex * COL_WIDTH,
      width: (t.colSpan ?? 1) * COL_WIDTH,
      top: HEADER_HEIGHT + (t.row ?? 0) * (ROW_HEIGHT + 5) + 10,
    })),
  );

  // --- 인라인 알림 ---
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const alertTimer = useRef<NodeJS.Timeout | null>(null);
  const showAlert = useCallback((msg: string) => {
    setAlertMsg(msg);
    if (alertTimer.current) clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(() => setAlertMsg(null), 2500);
  }, []);

  // --- 통합 모달 state ---
  const [modalMode, setModalMode] = useState<"closed" | "add" | "edit">("closed");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState("");
  const [formTutor, setFormTutor] = useState("");
  const [formStartYear, setFormStartYear] = useState("2026");
  const [formStartMonth, setFormStartMonth] = useState("4");
  const [formStartDay, setFormStartDay] = useState("");
  const [formEndYear, setFormEndYear] = useState("2026");
  const [formEndMonth, setFormEndMonth] = useState("4");
  const [formEndDay, setFormEndDay] = useState("");

  const resetForm = useCallback(() => {
    setFormTitle(""); setFormTags([]); setFormDescription(""); setFormTutor("");
    setFormStartYear("2026"); setFormStartMonth("4"); setFormStartDay("");
    setFormEndYear("2026"); setFormEndMonth("4"); setFormEndDay("");
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setEditingIndex(null);
    setModalMode("add");
  }, [resetForm]);

  const openEditModal = useCallback((index: number) => {
    const task = tasks[index];
    setFormTitle(task.title);
    setFormTags(task.tags.map((t) => t.name));
    setFormDescription(task.description ?? "");
    setFormTutor(task.tutor ?? "");
    const sDate = startDate + task.dayIndex;
    const eDate = sDate + (task.colSpan ?? 1) - 1;
    setFormStartYear("2026"); setFormStartMonth("4"); setFormStartDay(String(sDate));
    setFormEndYear("2026"); setFormEndMonth("4"); setFormEndDay(String(eDate));
    setEditingIndex(index);
    setModalMode("edit");
  }, [tasks, startDate]);

  const handleSave = useCallback(() => {
    const tagObjects = formTags.map((name) => {
      const chip = ALL_SCHOOL_CHIPS.find((c) => c.name === name);
      return { name, color: chip?.color ?? ("pink" as ChipColor) };
    });
    const sDayNum = Number(formStartDay) || startDate;
    const eDayNum = Number(formEndDay) || sDayNum;
    const dayIndex = sDayNum - startDate;
    const colSpan = Math.max(1, eDayNum - sDayNum + 1);
    const newLeft = PAD_X + dayIndex * COL_WIDTH;
    const newWidth = colSpan * COL_WIDTH;

    if (modalMode === "edit" && editingIndex !== null) {
      const newTop = tasks[editingIndex].top;
      if (checkCollision(newLeft, newWidth, newTop, tasks, editingIndex)) {
        showAlert(labels.conflictAlert);
        return;
      }
      setTasks((prev) =>
        prev.map((t, i) =>
          i === editingIndex
            ? { ...t, title: formTitle, tags: tagObjects, description: formDescription, tutor: formTutor, dayIndex, colSpan, left: newLeft, width: newWidth }
            : t,
        ),
      );
    } else if (modalMode === "add" && formTitle.trim()) {
      // 빈 행 찾기
      let targetRow = 0;
      while (checkCollision(newLeft, newWidth, HEADER_HEIGHT + targetRow * ROW_HEIGHT + 10, tasks, -1)) {
        targetRow++;
        if (targetRow > 20) break;
      }
      setTasks((prev) => [
        ...prev,
        {
          title: formTitle, tags: tagObjects, description: formDescription, tutor: formTutor,
          dayIndex, colSpan,
          left: newLeft, width: newWidth,
          top: HEADER_HEIGHT + targetRow * ROW_HEIGHT + 10,
        },
      ]);
    }
    setModalMode("closed");
  }, [modalMode, editingIndex, formTitle, formTags, formDescription, formTutor, formStartDay, formEndDay, startDate, tasks, showAlert]);

  const handleDelete = useCallback(() => {
    if (editingIndex === null) return;
    setTasks((prev) => prev.filter((_, i) => i !== editingIndex));
    setModalMode("closed");
  }, [editingIndex]);

  const handleCloseModal = useCallback(() => setModalMode("closed"), []);

  // --- 스크롤 state ---
  const [scrollX, setScrollX] = useState(0);
  const isPanning = useRef(false);
  const panStart = useRef<{ mouseX: number; scrollX: number } | null>(null);
  const calRef = useRef<HTMLDivElement>(null);

  const [measuredWidth, setMeasuredWidth] = useState<number>(cfg.visibleWidth);
  useEffect(() => {
    if (type === 2 && calRef.current) {
      const w = calRef.current.clientWidth;
      if (w > 0) setMeasuredWidth(w);
    }
  }, [type]);
  const visibleWidth = type === 1 ? cfg.visibleWidth : measuredWidth;

  const maxScroll = Math.max(0, contentWidth - visibleWidth);
  const scrollbarWidth = maxScroll > 0 ? (visibleWidth / contentWidth) * visibleWidth : visibleWidth;
  const scrollbarLeft = maxScroll > 0 ? (scrollX / maxScroll) * (visibleWidth - scrollbarWidth) : 0;

  // --- 드래그/리사이즈 공통 state ---
  const [dragging, setDragging] = useState<number | null>(null);
  const [resizing, setResizing] = useState<{ index: number; edge: "left" | "right" } | null>(null);
  const [preview, setPreview] = useState<{ left: number; width: number; top: number } | null>(null);
  const dragStart = useRef<{ mouseX: number; mouseY: number; origLeft: number; origWidth: number; origTop: number } | null>(null);

  // --- 배경 패닝 ---
  const handleBgMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isPanning.current = true;
      panStart.current = { mouseX: e.clientX, scrollX: scrollX };
    },
    [scrollX],
  );

  const handleBgMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning.current && panStart.current) {
        const dx = panStart.current.mouseX - e.clientX;
        const newScroll = Math.max(0, Math.min(maxScroll, panStart.current.scrollX + dx));
        setScrollX(newScroll);
      }
    },
    [maxScroll],
  );

  const handleBgMouseUp = useCallback(() => {
    isPanning.current = false;
    panStart.current = null;
  }, []);

  // --- TaskCard mousedown: 드래그 vs 리사이즈 분기 ---
  const handleTaskMouseDown = useCallback(
    (i: number, e: React.MouseEvent, edge: "left" | "right" | "body") => {
      e.preventDefault();
      e.stopPropagation();
      const task = tasks[i];
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        origLeft: task.left,
        origWidth: task.width,
        origTop: task.top,
      };

      if (edge === "body") {
        setDragging(i);
      } else {
        setResizing({ index: i, edge });
      }
      setPreview({ left: task.left, width: task.width, top: task.top });
    },
    [tasks],
  );

  // --- 드래그 move ---
  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging === null || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      const newLeft = dragStart.current.origLeft + dx;
      const newTop = dragStart.current.origTop + dy;

      // 좌측 강제 스냅 → 폭 유지한 채 우측도 자동 스냅라인에 정렬
      const sLeft = snapToLine(newLeft);
      const colCount = Math.round(dragStart.current.origWidth / COL_WIDTH);
      const sRight = sLeft + colCount * COL_WIDTH;

      // 행 스냅
      const snappedRow = Math.max(0, Math.round((newTop - HEADER_HEIGHT - 10) / ROW_HEIGHT));
      const snappedTop = HEADER_HEIGHT + snappedRow * ROW_HEIGHT + 10;

      setPreview({ left: sLeft, width: sRight - sLeft, top: snappedTop });
    },
    [dragging, snapLines],
  );

  // --- 리사이즈 move ---
  const handleResizeMove = useCallback(
    (e: React.MouseEvent) => {
      if (!resizing || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;

      if (resizing.edge === "right") {
        const newRight = dragStart.current.origLeft + dragStart.current.origWidth + dx;
        const snappedRight = snapToLine(newRight);
        const newWidth = Math.max(COL_WIDTH, snappedRight - dragStart.current.origLeft);
        setPreview({ left: dragStart.current.origLeft, width: newWidth, top: dragStart.current.origTop });
      } else {
        const newLeft = dragStart.current.origLeft + dx;
        const snappedLeft = snapToLine(newLeft);
        const origRight = dragStart.current.origLeft + dragStart.current.origWidth;
        const newWidth = Math.max(COL_WIDTH, origRight - snappedLeft);
        setPreview({ left: origRight - newWidth, width: newWidth, top: dragStart.current.origTop });
      }
    },
    [resizing, snapLines],
  );

  // --- 드래그/리사이즈 완료 (충돌 검사 포함) ---
  const handleInteractionUp = useCallback(() => {
    const activeIndex = dragging ?? resizing?.index ?? null;
    if (activeIndex === null || !preview) {
      setDragging(null);
      setResizing(null);
      setPreview(null);
      return;
    }

    // 충돌 검사
    if (checkCollision(preview.left, preview.width, preview.top, tasks, activeIndex)) {
      showAlert("해당 일자에 이미 일정이 있어 변경이 어렵습니다.");
      // 원래 위치로 복귀
      setDragging(null);
      setResizing(null);
      setPreview(null);
      dragStart.current = null;
      return;
    }

    // dayIndex, colSpan 역산
    const newDayIndex = Math.round((preview.left - PAD_X) / COL_WIDTH);
    const newColSpan = Math.round(preview.width / COL_WIDTH);

    setTasks((prev) =>
      prev.map((t, i) =>
        i === activeIndex
          ? { ...t, left: preview.left, width: preview.width, top: preview.top, dayIndex: newDayIndex, colSpan: newColSpan }
          : t,
      ),
    );
    setDragging(null);
    setResizing(null);
    setPreview(null);
    dragStart.current = null;
  }, [dragging, resizing, preview, tasks, showAlert]);

  // --- 통합 마우스 핸들러 ---
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging !== null) handleDragMove(e);
      else if (resizing) handleResizeMove(e);
      else handleBgMouseMove(e);
    },
    [dragging, resizing, handleDragMove, handleResizeMove, handleBgMouseMove],
  );

  const handleMouseUp = useCallback(() => {
    if (dragging !== null || resizing) handleInteractionUp();
    handleBgMouseUp();
  }, [dragging, resizing, handleInteractionUp, handleBgMouseUp]);

  // --- 스크롤바 드래그 ---
  const isScrollbarDragging = useRef(false);
  const scrollbarDragStart = useRef<{ mouseX: number; scrollX: number } | null>(null);

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isScrollbarDragging.current && scrollbarDragStart.current) {
        const dx = e.clientX - scrollbarDragStart.current.mouseX;
        const scrollRatio = dx / (visibleWidth - scrollbarWidth);
        const newScroll = Math.max(0, Math.min(maxScroll, scrollbarDragStart.current.scrollX + scrollRatio * maxScroll));
        setScrollX(newScroll);
      }
    };
    const handleGlobalUp = () => {
      isScrollbarDragging.current = false;
      scrollbarDragStart.current = null;
    };
    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
    };
  }, [maxScroll, scrollbarWidth, visibleWidth]);

  const handleScrollbarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isScrollbarDragging.current = true;
      scrollbarDragStart.current = { mouseX: e.clientX, scrollX: scrollX };
    },
    [scrollX],
  );

  const [isWBSHovered, setIsWBSHovered] = useState(false);

  // --- 리사이즈 커서 감지 헬퍼 ---
  const getEdgeFromMouse = useCallback(
    (taskIndex: number, clientX: number): "left" | "right" | "body" => {
      if (!calRef.current) return "body";
      const task = tasks[taskIndex];
      const calRect = calRef.current.getBoundingClientRect();
      const mouseXInContent = clientX - calRect.left + scrollX;
      const distToLeft = Math.abs(mouseXInContent - task.left);
      const distToRight = Math.abs(mouseXInContent - (task.left + task.width));
      if (distToLeft <= EDGE_ZONE) return "left";
      if (distToRight <= EDGE_ZONE) return "right";
      return "body";
    },
    [tasks, scrollX],
  );

  return (
    <>
      <div
        style={maxWidth ? { maxWidth, width: "100%" } : undefined}
        className={cn(
          "rounded-[48px] bg-[var(--color-bg-subtle)] flex flex-col select-none",
          type === 1 ? "pt-5 pb-2 px-8 gap-4" : "pt-5 pb-2 px-2 gap-4",
          !maxWidth && cfg.outerW,
          cfg.outerH,
          onClick && "cursor-pointer",
          className,
        )}
        onMouseEnter={() => setIsWBSHovered(true)}
        onMouseLeave={() => setIsWBSHovered(false)}
        onClick={onClick}
      >
        {/* Title row */}
        <div className={cn("flex items-center justify-between", type === 2 && "px-6")}>
          {type === 1 ? (
            <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3125px] leading-[36px]">{title}</h2>
          ) : (
            <div className="flex items-baseline gap-2">
              <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3125px] leading-[36px]">{month}</h2>
              <span className="text-[18px] font-normal text-[var(--color-text-disabled)] tracking-[-0.36px]">{year}</span>
            </div>
          )}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-[20px] bg-[var(--color-bg-surface)] cursor-pointer hover:bg-white transition-colors"
            onClick={type === 2 ? openAddModal : undefined}
          >
            <Icon name="plus" size="lg" color="var(--color-icon-secondary)" />
          </button>
        </div>

        {/* Calendar body */}
        <div className="flex flex-col gap-2 flex-1 relative">
          <div
            ref={calRef}
            className={cn(
              "relative flex-shrink-0 overflow-hidden rounded-[40px]",
              type === 1 ? "w-[829px] self-center" : "self-stretch",
              dragging !== null ? "cursor-grabbing" : resizing ? "cursor-col-resize" : "cursor-grab",
            )}
            style={{ height: cfg.bodyHeight }}
            onMouseDown={handleBgMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="absolute top-0"
              style={{ left: `-${scrollX}px`, width: `${contentWidth}px`, height: cfg.bodyHeight }}
            >
              <div className="absolute inset-0 bg-white" />

              {/* Date header */}
              <div
                className="absolute top-0 left-0 h-[56px] flex items-center"
                style={{ width: `${contentWidth}px`, paddingLeft: PAD_X, paddingRight: PAD_X }}
              >
                <div className="flex" style={{ gap: 0 }}>
                  {dates.map((d, i) => {
                    const isToday = type === 2 && today !== undefined && d.date === today;
                    return (
                      <div key={i} className="flex flex-col items-center py-1 gap-0.5" style={{ width: COL_WIDTH }}>
                        <span className={cn(
                          "text-[12px] tracking-[-0.24px] leading-[16px] text-center",
                          isToday ? "text-[var(--color-text-primary)] font-semibold" : "text-[var(--color-text-primary)] font-normal",
                        )}>{d.day}</span>
                        <span className={cn(
                          "text-[12px] tracking-[-0.24px] leading-[16px] text-center",
                          isToday
                            ? "w-[24px] h-[24px] flex items-center justify-center rounded-full bg-[var(--color-bg-inverse)] text-white font-semibold"
                            : "text-[var(--color-text-primary)] font-normal",
                        )}>{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vertical lines */}
              {snapLines.map((x, i) => (
                <div key={i} className="absolute bg-[var(--color-bg-subtle)]" style={{ left: x, top: HEADER_HEIGHT, width: 1, height: cfg.bodyHeight - HEADER_HEIGHT }} />
              ))}

              {/* Task cards */}
              {tasks.map((task, i) => {
                const isActive = dragging === i || resizing?.index === i;
                return (
                  <div
                    key={i}
                    className={cn("absolute", isActive && "opacity-30 pointer-events-none")}
                    style={{ left: `${task.left}px`, top: `${task.top}px`, width: `${task.width}px` }}
                  >
                    {/* 좌측 리사이즈 핸들 */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[10px] cursor-col-resize z-10"
                      onMouseDown={(e) => handleTaskMouseDown(i, e, "left")}
                    />
                    {/* 중앙 드래그 영역 */}
                    <div
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={(e) => {
                        const edge = getEdgeFromMouse(i, e.clientX);
                        handleTaskMouseDown(i, e, edge);
                      }}
                    >
                      <TaskCard
                        title={task.title}
                        tags={task.tags}
                        onEdit={type === 2 ? () => openEditModal(i) : undefined}
                      />
                    </div>
                    {/* 우측 리사이즈 핸들 */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-[10px] cursor-col-resize z-10"
                      onMouseDown={(e) => handleTaskMouseDown(i, e, "right")}
                    />
                  </div>
                );
              })}

              {/* Drag/Resize preview */}
              {(dragging !== null || resizing) && preview && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{ left: `${preview.left}px`, top: `${preview.top}px`, width: `${preview.width}px` }}
                >
                  <div className={cn("opacity-80 shadow-lg", resizing && "ring-2 ring-[var(--color-border-brand)] rounded-xl")}>
                    <TaskCard
                      title={tasks[(dragging ?? resizing?.index)!].title}
                      tags={tasks[(dragging ?? resizing?.index)!].tags}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 충돌 알림 */}
          {alertMsg && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white border border-[var(--color-border-subtle)] shadow-lg rounded-[12px] px-4 py-2.5 animate-[fadeIn_0.15s_ease-out]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--color-text-warning)" strokeWidth="1.5" fill="none"/><path d="M8 5.5V8.5" stroke="var(--color-text-warning)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="10.5" r="0.6" fill="var(--color-text-warning)"/></svg>
              <span className="text-[length:var(--text-sm-alt)] text-[var(--color-text-secondary)]">{alertMsg}</span>
            </div>
          )}

          {/* Scrollbar */}
          {maxScroll > 0 && (
            <div
              className={cn(
                "relative transition-opacity duration-200",
                type === 1 ? "w-[829px] self-center" : "self-stretch",
                isWBSHovered ? "opacity-100" : "opacity-0",
              )}
              style={{ height: SCROLLBAR_HEIGHT }}
            >
              <div className="absolute inset-0 rounded-full bg-[var(--color-bg-disabled)]" />
              <div
                className="absolute top-0 rounded-full bg-[var(--color-text-disabled)] hover:bg-[var(--color-text-tertiary)] cursor-grab active:cursor-grabbing transition-colors"
                style={{ left: scrollbarLeft, width: scrollbarWidth, height: SCROLLBAR_HEIGHT }}
                onMouseDown={handleScrollbarMouseDown}
              />
            </div>
          )}
        </div>
      </div>

      {/* 일정 추가/편집 모달 (type 2) */}
      {type === 2 && (
        <Modal isOpen={modalMode !== "closed"} onClose={handleCloseModal} title={modalMode === "edit" ? labels.modalEditTitle : labels.modalAddTitle} size="md">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)] mb-1.5">{labels.fieldTitle}</label>
              <TextField value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder={labels.fieldTitlePlaceholder} size="sm" />
            </div>
            <div>
              <label className="block text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)] mb-1.5">{labels.fieldSchool}</label>
              <ChipReels items={ALL_SCHOOL_CHIPS} defaultSelected={formTags} onChange={setFormTags} multiSelect size="sm" />
            </div>
            <div>
              <label className="block text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)] mb-1.5">{labels.fieldDescription}</label>
              <TextField value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder={labels.fieldDescriptionPlaceholder} size="sm" />
            </div>
            <div>
              <label className="block text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)] mb-1.5">{labels.fieldOwner}</label>
              <Dropdown options={TUTOR_OPTIONS} value={formTutor} onChange={setFormTutor} placeholder={labels.fieldOwner} size="sm" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="block text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)]">{labels.fieldStartDate}</label>
                <div className="flex gap-2">
                  <Dropdown options={YEAR_OPTIONS} value={formStartYear} onChange={setFormStartYear} placeholder={labels.yearSuffix} size="sm" className="flex-1" />
                  <Dropdown options={MONTH_OPTIONS} value={formStartMonth} onChange={setFormStartMonth} placeholder={labels.monthSuffix} size="sm" className="flex-1" />
                  <Dropdown options={DAY_31_OPTIONS} value={formStartDay} onChange={setFormStartDay} placeholder={labels.daySuffix} size="sm" className="flex-1" />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="block text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)]">{labels.fieldEndDate}</label>
                <div className="flex gap-2">
                  <Dropdown options={YEAR_OPTIONS} value={formEndYear} onChange={setFormEndYear} placeholder={labels.yearSuffix} size="sm" className="flex-1" />
                  <Dropdown options={MONTH_OPTIONS} value={formEndMonth} onChange={setFormEndMonth} placeholder={labels.monthSuffix} size="sm" className="flex-1" />
                  <Dropdown options={DAY_31_OPTIONS} value={formEndDay} onChange={setFormEndDay} placeholder={labels.daySuffix} size="sm" className="flex-1" />
                </div>
              </div>
            </div>
            <div className="flex items-center pt-2">
              {modalMode === "edit" && (
                <button onClick={handleDelete} className="text-[length:var(--text-sm-alt)] text-[var(--color-text-error)] hover:text-[var(--palette-error-700)] cursor-pointer transition-colors">{labels.deleteButton}</button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleCloseModal}>{labels.cancelButton}</Button>
                <Button variant="primary" size="sm" onClick={handleSave}>{labels.saveButton}</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
}
