"use client";
import { Children, cloneElement, isValidElement, useId } from "react";
import { cn } from "@/lib/cn";

interface FormFieldProps {
  /** 라벨 텍스트 (시각 + 스크린리더). 미지정 시 라벨 영역 자체 생략 — helperText만 있는 케이스 가능. */
  label?: string;
  /** 필수 표시 (* 추가, aria-required) */
  required?: boolean;
  /** 보조 설명 (input 아래) */
  helperText?: string;
  /** 에러 메시지 (지정 시 helperText보다 우선 표시, aria-invalid 자동 적용) */
  errorMessage?: string;
  /** 라벨 시각적 감춤 (스크린리더만 읽음) */
  hideLabel?: boolean;
  /** 최대 폭 (기본 "100%") */
  maxWidth?: string;
  /** form control 1개 (TextField/Dropdown/DatePicker/등) */
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
    error?: boolean;
  }>;
  className?: string;
}

export function FormField({
  label,
  required = false,
  helperText,
  errorMessage,
  hideLabel = false,
  maxWidth = "100%",
  children,
  className,
}: FormFieldProps) {
  const fieldId = useId();
  const helperId = useId();
  const errorId = useId();
  const hasError = Boolean(errorMessage);

  const child = Children.only(children);
  if (!isValidElement(child)) {
    return null;
  }

  const describedBy = [
    hasError ? errorId : null,
    !hasError && helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const enhanced = cloneElement(child, {
    id: child.props.id ?? fieldId,
    "aria-describedby": describedBy,
    "aria-invalid": hasError ? true : child.props["aria-invalid"],
    "aria-required": required || child.props["aria-required"],
    error: hasError || child.props.error,
  });

  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      style={{ maxWidth }}
    >
      {label && (
        <label
          htmlFor={enhanced.props.id}
          className={cn(
            "text-[14px] font-medium text-[var(--color-text-primary)]",
            hideLabel && "sr-only",
          )}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-[var(--color-text-error)] ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      {enhanced}
      {hasError ? (
        <span id={errorId} className="text-[12px] text-[var(--color-text-error)]">
          {errorMessage}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-[12px] text-[var(--color-text-secondary)]">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export type { FormFieldProps };
