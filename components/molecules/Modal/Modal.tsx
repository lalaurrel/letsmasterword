"use client";

import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** true면 ESC/외부 클릭/X 버튼 누를 때 확인 다이얼로그 표시. 폼 입력 손실 방지 시 사용. */
  confirmOnClose?: boolean;
  /** confirmOnClose=true일 때 확인 다이얼로그 라벨. 미지정 시 한국어 기본값. */
  confirmLabels?: {
    title?: string;
    description?: string;
    confirm?: string;
    cancel?: string;
  };
  className?: string;
}

const sizeStyles = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
};

const DEFAULT_CONFIRM_LABELS = {
  title: "정말 닫으시겠어요?",
  description: "작성 중인 내용이 사라집니다.",
  confirm: "닫기",
  cancel: "계속 작성",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  confirmOnClose = false,
  confirmLabels,
  className,
}: ModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const labels = { ...DEFAULT_CONFIRM_LABELS, ...confirmLabels };

  const attemptClose = useCallback(() => {
    if (confirmOnClose) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  }, [confirmOnClose, onClose]);

  const confirmClose = useCallback(() => {
    setShowConfirm(false);
    onClose();
  }, [onClose]);

  const cancelClose = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConfirm) {
          cancelClose();
        } else {
          attemptClose();
        }
      }
    },
    [attemptClose, cancelClose, showConfirm],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  /* 모달이 닫힐 때 confirm 상태도 리셋 */
  useEffect(() => {
    if (!isOpen) setShowConfirm(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "animate-[fadeIn_0.2s_ease-out]",
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={attemptClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-white rounded-[24px] mx-4",
          "animate-[scaleIn_0.2s_ease-out]",
          sizeStyles[size],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <h2 id="modal-title" className="text-[18px] font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-primary)]">
              {title}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={attemptClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="var(--color-icon-secondary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>

      {/* 닫기 확인 다이얼로그 (중첩) */}
      {showConfirm && (
        <div
          role="alertdialog"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 animate-[fadeIn_0.15s_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelClose();
          }}
        >
          <div className="bg-white rounded-[20px] p-6 max-w-[360px] mx-4 flex flex-col gap-4 shadow-[var(--shadow-elevation-high)]">
            <div className="flex flex-col gap-1">
              <h3 id="confirm-title" className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                {labels.title}
              </h3>
              <p id="confirm-desc" className="text-[14px] text-[var(--color-text-tertiary)]">
                {labels.description}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelClose}
                className="px-4 py-2 text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] rounded-[12px] cursor-pointer transition-colors"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={confirmClose}
                className="px-4 py-2 text-[14px] font-medium bg-[var(--color-text-error)] text-white rounded-[12px] cursor-pointer hover:opacity-90 transition-opacity"
              >
                {labels.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export type { ModalProps };
