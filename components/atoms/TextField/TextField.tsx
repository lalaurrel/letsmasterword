import { useId } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps {
  /** input id (FormField wrapper와 연결 시 사용). */
  id?: string;
  /** 입력 위쪽 라벨. 미지정 시 라벨 영역 생략. */
  label?: string;
  /** 입력 아래 보조 설명. errorMessage가 있으면 그쪽 우선. */
  helperText?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  error?: boolean;
  /** 에러 상태일 때 표시할 메시지. error=true와 함께 사용. */
  errorMessage?: string;
  /** 라벨 우측에 * (asterisk) 표시 + aria-required 자동. 필수 입력을 시각·스크린리더 양쪽에 알림. */
  asterisk?: boolean;
  /** 스크린리더용 라벨 (시각 라벨이 외부에 있을 때 사용). */
  "aria-label"?: string;
  /** 시각 라벨의 id (label htmlFor 대체). */
  "aria-labelledby"?: string;
  /** 보조 설명 영역의 id (FormField가 자동 주입). */
  "aria-describedby"?: string;
  /** 필수 입력 여부 (FormField가 자동 주입). */
  "aria-required"?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "h-[36px] text-[14px] px-3",
  md: "h-[44px] text-[16px] px-4",
  lg: "h-[48px] text-[18px] px-5",
};

export function TextField({
  id,
  label,
  helperText,
  placeholder,
  value,
  onChange,
  size = "md",
  disabled = false,
  error = false,
  errorMessage,
  asterisk = false,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? (label ? autoId : undefined);
  const errorId = useId();
  const helperId = useId();
  const hasError = error || Boolean(errorMessage);
  const describedBy =
    rest["aria-describedby"] ??
    (hasError && errorMessage ? errorId : helperText ? helperId : undefined);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[14px] font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {asterisk && (
            <span aria-hidden="true" className="text-[var(--color-text-error)] ml-0.5">*</span>
          )}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        aria-required={asterisk || rest["aria-required"] || undefined}
        aria-label={rest["aria-label"]}
        aria-labelledby={rest["aria-labelledby"]}
        className={cn(
          "w-full rounded-[12px] border-[1.5px] outline-none transition-colors font-[family-name:var(--font-primary)]",
          "border-[var(--color-border-default)] bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]",
          "focus:border-[var(--color-border-brand)] focus:border-2",
          hasError && "border-[var(--color-text-error)] focus:border-[var(--color-text-error)]",
          disabled && "bg-[var(--color-bg-surface)] text-[var(--color-text-disabled)] cursor-not-allowed",
          sizeStyles[size],
          className,
        )}
      />
      {hasError && errorMessage ? (
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

export type { TextFieldProps };
