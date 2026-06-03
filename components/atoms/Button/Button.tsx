import { cn } from "@/lib/cn";
import { Icon } from "@/lib/components/atoms/Icon/Icon";

interface ButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  interaction?: "default" | "hovered" | "pressed" | "selected" | "focused";
  onlyIcon?: boolean;
  showStartIcon?: boolean;
  showEndIcon?: boolean;
  iconName?: "speak" | "send" | "stop" | "placeholder" | "chevron-down" | "plus" | "seemore" | "calendar" | "message" | "document" | "sparkle";
  loading?: boolean;
  /** 비활성 상태 — 클릭 무시 + 시각 처리 (opacity + cursor). */
  disabled?: boolean;
  navItem?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

/* ── 색상 매핑 ── CSS 변수 참조 (tokens.css Role/Component 토큰) ── */
const C = {
  bgInverse:      "bg-[var(--color-bg-inverse)]",
  bgAccentSubtle: "bg-[var(--color-bg-accent-subtle)]",
  bgSurface:      "bg-[var(--color-bg-surface)]",
  bgDisabled:     "bg-[var(--color-bg-disabled)]",
  bgBrand:        "bg-[var(--color-brand-primary)]",
  bgBrandHover:   "bg-[var(--color-brand-primary-hover)]",
  bgSelection:    "bg-[var(--color-brand-selection)]",
  bgTransparent:  "bg-transparent",
  bgPrimary:      "bg-[var(--color-text-primary)]",
  textInverse:    "text-[var(--color-text-inverse)]",
  textSecondary:  "text-[var(--color-text-secondary)]",
  textAccent:     "text-[var(--color-text-accent)]",
  textPrimary:    "text-[var(--color-text-primary)]",
  textBrandSec:   "text-[var(--color-brand-secondary)]",
  borderBrand:    "border-[var(--color-border-brand)]",
  borderBrandSec: "border-[var(--color-brand-secondary)]",
  ringBrand:      "ring-[var(--color-border-brand)]",
};

const variantDefault = {
  primary:   `${C.bgInverse} ${C.textInverse}`,
  secondary: `${C.bgAccentSubtle} ${C.textAccent}`,
  tertiary:  `${C.bgTransparent} ${C.textSecondary}`,
  outline:   `${C.bgTransparent} ${C.textAccent} border ${C.borderBrand}`,
  ghost:     `${C.bgTransparent} ${C.textSecondary}`,
  icon:      `${C.bgInverse} ${C.textInverse}`,
};

const variantHovered = {
  primary:   `${C.bgBrandHover} ${C.textInverse}`,
  secondary: `bg-[var(--color-bg-accent-subtle)] ${C.textAccent}`,
  tertiary:  `${C.bgTransparent} ${C.textSecondary}`,
  outline:   `${C.bgTransparent} ${C.textBrandSec} border ${C.borderBrandSec}`,
  ghost:     `${C.bgSurface} ${C.textSecondary}`,
  icon:      `${C.bgBrandHover} ${C.textInverse}`,
};

const variantPressed = {
  primary:   `${C.bgBrand} ${C.textPrimary}`,
  secondary: `${C.bgSelection} ${C.textAccent}`,
  tertiary:  `${C.bgSurface} ${C.textSecondary}`,
  outline:   `bg-[var(--color-brand-selection)] ${C.textAccent} border ${C.borderBrand}`,
  ghost:     `bg-[var(--color-text-primary)] ${C.textInverse}`,
  icon:      `${C.bgBrand} ${C.textPrimary}`,
};

const variantSelected = {
  primary:   `${C.bgInverse} ${C.textAccent}`,
  secondary: `${C.bgSelection} ${C.textPrimary}`,
  tertiary:  `${C.bgTransparent} ${C.textSecondary}`,
  outline:   `${C.bgTransparent} ${C.textAccent} border-2 ${C.borderBrand}`,
  ghost:     `${C.bgDisabled} ${C.textSecondary}`,
  icon:      `${C.bgInverse} ${C.textInverse}`,
};

const variantFocused = {
  primary:   `${C.bgInverse} ${C.textInverse} ring-2 ${C.ringBrand}`,
  secondary: `${C.bgAccentSubtle} ${C.textAccent} ring-2 ${C.ringBrand}`,
  tertiary:  `${C.bgTransparent} ${C.textSecondary} ring-2 ${C.ringBrand}`,
  outline:   `bg-[var(--color-bg-accent-subtle)] ${C.textAccent} border-2 ${C.borderBrandSec}`,
  ghost:     `${C.bgTransparent} ${C.textSecondary} ring-2 ${C.ringBrand}`,
  icon:      `${C.bgInverse} ${C.textInverse} ring-2 ${C.ringBrand}`,
};

const interactionMap = {
  default: variantDefault,
  hovered: variantHovered,
  pressed: variantPressed,
  selected: variantSelected,
  focused: variantFocused,
};

const hoverActiveStyles = {
  primary: `hover:${C.bgBrandHover} active:${C.bgBrand} active:${C.textPrimary}`,
  secondary: `hover:bg-[var(--color-bg-accent-subtle)] active:${C.bgSelection}`,
  tertiary: `hover:${C.bgTransparent} active:${C.bgSurface}`,
  outline: `hover:${C.textBrandSec} hover:${C.borderBrandSec} active:${C.bgSelection} active:${C.textAccent} active:${C.borderBrand}`,
  ghost: `hover:${C.bgSurface} active:bg-[var(--color-text-primary)] active:${C.textInverse}`,
  icon: `hover:${C.bgBrandHover} active:${C.bgBrand} active:${C.textPrimary}`,
};

/* TextField sm/md/lg와 height + text size 정확히 일치 (36/44/48).
   radius도 사이즈에 비례: sm은 12px (33%), md/lg는 16px (36%/33%) — 시각 균형 유지. */
const sizeStyles = {
  sm: "h-[36px] px-4 text-[14px] tracking-[-0.28px] rounded-[var(--radius-md)]",
  md: "h-[44px] px-5 text-[16px] tracking-[-0.32px] rounded-[var(--radius-interactive-md)]",
  lg: "h-[48px] px-5 text-[18px] tracking-[-0.36px] rounded-[var(--radius-interactive-md)]",
};

const iconSizeStyles = {
  sm: "w-[36px] h-[36px]",
  md: "w-[44px] h-[44px]",
  lg: "w-[48px] h-[48px]",
};

function LoadingSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="40 20" opacity="0.8" />
    </svg>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  interaction = "default",
  onlyIcon = false,
  showStartIcon = false,
  showEndIcon = false,
  iconName = "placeholder",
  loading = false,
  disabled = false,
  navItem = false,
  onClick,
  type = "button",
  className,
}: ButtonProps) {
  const isIconVariant = variant === "icon" || onlyIcon;
  const v = isIconVariant ? "icon" : variant;
  const stateStyles = interactionMap[interaction][v];
  const isInactive = loading || disabled;
  const pseudoStyles = interaction === "default" && !isInactive ? hoverActiveStyles[v] : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "transition-colors font-[family-name:var(--font-primary)] outline-none inline-flex items-center justify-center gap-2",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)] focus-visible:ring-offset-2",
        navItem ? "font-normal" : "font-medium",
        !isInactive && "cursor-pointer",
        stateStyles,
        pseudoStyles,
        loading && "pointer-events-none opacity-90",
        disabled && "cursor-not-allowed opacity-50 pointer-events-none",
        isIconVariant
          ? cn("rounded-full p-0", iconSizeStyles[size])
          : sizeStyles[size],
        className,
      )}
      onClick={isInactive ? undefined : onClick}
    >
      {loading ? (
        <LoadingSpinner />
      ) : isIconVariant ? (
        <Icon name={iconName} size="md" />
      ) : (
        <>
          {showStartIcon && <Icon name={iconName} size="md" />}
          {children}
          {showEndIcon && <Icon name={iconName} size="md" />}
        </>
      )}
    </button>
  );
}

export type { ButtonProps };
