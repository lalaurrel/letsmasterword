"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  /** 좌측 아이콘 표시 여부 (기본 true). false 지정 시 텍스트만 표시. */
  showIcon?: boolean;
  /** showIcon=true일 때 기본 status 아이콘 대신 표시할 커스텀 노드 (예: <Icon name="send" />). */
  icon?: React.ReactNode;
  /** 자동 닫힘 시간 (ms). 기본 3000. 0 지정 시 자동 닫힘 비활성. */
  duration?: number;
}

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  showIcon: boolean;
  customIcon?: React.ReactNode;
  exiting?: boolean;
}

type ToastFn = (message: string, options?: ToastOptions) => void;

interface ToastContextValue {
  toast: {
    success: ToastFn;
    error: ToastFn;
    info: ToastFn;
    warning: ToastFn;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const typeConfig: Record<ToastType, { borderColor: string; icon: React.ReactNode }> = {
  success: {
    borderColor: "border-l-[var(--color-text-success)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="var(--color-text-success)" strokeWidth="1.5" fill="none" />
        <path d="M6 9L8 11L12 7" stroke="var(--color-text-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    borderColor: "border-l-[var(--color-text-error)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="var(--color-text-error)" strokeWidth="1.5" fill="none" />
        <path d="M7 7L11 11M11 7L7 11" stroke="var(--color-text-error)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    borderColor: "border-l-[var(--color-text-accent)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="var(--color-text-accent)" strokeWidth="1.5" fill="none" />
        <path d="M9 8V12" stroke="var(--color-text-accent)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="6" r="0.75" fill="var(--color-text-accent)" />
      </svg>
    ),
  },
  warning: {
    borderColor: "border-l-[var(--color-text-warning)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3L16 15H2L9 3Z" stroke="var(--color-text-warning)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M9 8V11" stroke="var(--color-text-warning)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="13" r="0.75" fill="var(--color-text-warning)" />
      </svg>
    ),
  },
};

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id = `toast-${++idCounter}`;
      const showIcon = options?.showIcon ?? true;
      const duration = options?.duration ?? 3000;
      setToasts((prev) => [...prev, { id, type, message, showIcon, customIcon: options?.icon }]);
      if (duration > 0) {
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [removeToast],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const toast = {
    success: (message: string, options?: ToastOptions) => addToast("success", message, options),
    error: (message: string, options?: ToastOptions) => addToast("error", message, options),
    info: (message: string, options?: ToastOptions) => addToast("info", message, options),
    warning: (message: string, options?: ToastOptions) => addToast("warning", message, options),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((item) => {
          const config = typeConfig[item.type];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 bg-white border-l-4 shadow-[var(--shadow-elevation-high)] rounded-[12px] px-4 py-3 min-w-[280px] max-w-[400px]",
                config.borderColor,
                item.exiting
                  ? "animate-[toastOut_0.2s_ease-in_forwards]"
                  : "animate-[toastIn_0.2s_ease-out]",
              )}
            >
              {item.showIcon && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {item.customIcon ?? config.icon}
                </span>
              )}
              <span className="flex-1 text-[14px] text-[var(--color-text-secondary)] font-[family-name:var(--font-primary)]">
                {item.message}
              </span>
              <button
                onClick={() => removeToast(item.id)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3L9 9M9 3L3 9" stroke="var(--color-icon-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}

export type { ToastOptions, ToastType };
