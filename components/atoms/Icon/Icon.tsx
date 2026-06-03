import { cn } from "@/lib/cn";

type IconName = "speak" | "send" | "plus" | "chevron-down" | "chevron-up" | "chevron-left" | "chevron-right" | "arrow-left" | "arrow-right" | "arrow-up" | "arrow-down" | "stop" | "placeholder" | "seemore" | "calendar" | "message" | "document" | "sparkle" | "close" | "search" | "check" | "upload";

type IconSize = "sm" | "md" | "lg";

/** sm=16px (dense decoration), md=20px (default), lg=24px (prominent action). */
const sizePx: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

interface IconProps {
  name: IconName;
  /** 크기 (sm=16 / md=20 / lg=24). 자유 px 사용 금지 — 신규 시각 갭 방지. */
  size?: IconSize;
  color?: string;
  /** 의미 있는 아이콘 단독 사용 시 (예: 단독 표시) 라벨 제공. 미지정 시 aria-hidden 처리됨. */
  "aria-label"?: string;
  className?: string;
}

const icons: Record<IconName, (color: string) => React.ReactNode> = {
  speak: (color) => (
    <>
      <path d="M10 15.8334V18.3334" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.833 8.33325V9.99992C15.833 11.547 15.2184 13.0307 14.1244 14.1247C13.0305 15.2187 11.5468 15.8333 9.99965 15.8333C8.45256 15.8333 6.96883 15.2187 5.87486 14.1247C4.7809 13.0307 4.16632 11.547 4.16632 9.99992V8.33325" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.4999 4.16681C12.4999 2.7861 11.3806 1.66681 9.99988 1.66681C8.61917 1.66681 7.49988 2.7861 7.49988 4.16681V10.0001C7.49988 11.3809 8.61917 12.5001 9.99988 12.5001C11.3806 12.5001 12.4999 11.3809 12.4999 10.0001V4.16681Z" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  send: (color) => (
    /* 시각 중심 보정: 화살표 tip이 우상단에 치우쳐 보이는 인식적 편향을
       translate(-0.5, 0.5)로 좌하단 미세 이동해 균형 잡음. */
    <g transform="translate(-0.5 0.5)">
      <path d="M12.1134 18.0716C12.145 18.1505 12.2001 18.2179 12.2711 18.2646C12.3421 18.3113 12.4258 18.3352 12.5107 18.333C12.5957 18.3308 12.678 18.3027 12.7466 18.2524C12.8151 18.2021 12.8666 18.1321 12.8942 18.0516L18.3109 2.2183C18.3375 2.14446 18.3426 2.06455 18.3255 1.98793C18.3085 1.9113 18.2699 1.84113 18.2144 1.78561C18.1589 1.7301 18.0887 1.69154 18.0121 1.67446C17.9355 1.65737 17.8555 1.66246 17.7817 1.68913L1.94837 7.1058C1.86795 7.13338 1.7979 7.1849 1.7476 7.25344C1.69731 7.32199 1.66918 7.40428 1.66701 7.48926C1.66483 7.57425 1.6887 7.65787 1.73542 7.7289C1.78214 7.79993 1.84947 7.85497 1.92837 7.88663L8.53671 10.5366C8.74561 10.6203 8.93542 10.7453 9.09468 10.9043C9.25394 11.0633 9.37936 11.2529 9.46337 11.4616L12.1134 18.0716Z" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.2116 1.78912L9.09497 10.905" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  plus: (color) => (
    <>
      <path d="M4 10H16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 4V16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  "chevron-down": (color) => (
    <path d="M6 8L10 12L14 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  "chevron-up": (color) => (
    <path d="M6 12L10 8L14 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  "chevron-left": (color) => (
    <path d="M12 6L8 10L12 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  "chevron-right": (color) => (
    <path d="M8 6L12 10L8 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  "arrow-left": (color) => (
    <>
      <path d="M16 10H4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 5L4 10L9 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "arrow-right": (color) => (
    <>
      <path d="M4 10H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 5L16 10L11 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "arrow-up": (color) => (
    <>
      <path d="M10 16V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 9L10 4L15 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "arrow-down": (color) => (
    <>
      <path d="M10 4V16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 11L10 16L15 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  close: (color) => (
    <>
      <path d="M5 5L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 5L5 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  search: (color) => (
    <>
      <circle cx="9" cy="9" r="6" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M13.5 13.5L17 17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  check: (color) => (
    <path d="M4 10L8 14L16 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  stop: (color) => (
    /* placeholder(16×16 outlined)와 시각 무게 정합. 기존 10×10에서 14×14로 확대. */
    <rect x="3" y="3" width="14" height="14" rx="3" fill={color} />
  ),
  placeholder: (color) => (
    <rect x="2" y="2" width="16" height="16" rx="4" stroke={color} strokeWidth="1.33" />
  ),
  seemore: (color) => (
    <path d="M8 6L12 10L8 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  calendar: (color) => (
    <>
      <rect x="3" y="4" width="14" height="13" rx="2" stroke={color} strokeWidth="1.33" />
      <path d="M3 8H17" stroke={color} strokeWidth="1.33" />
      <path d="M7 2V5" stroke={color} strokeWidth="1.33" strokeLinecap="round" />
      <path d="M13 2V5" stroke={color} strokeWidth="1.33" strokeLinecap="round" />
    </>
  ),
  message: (color) => (
    <>
      <path d="M4 4H16C16.55 4 17 4.45 17 5V14C17 14.55 16.55 15 16 15H6L3 18V5C3 4.45 3.45 4 4 4Z" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  document: (color) => (
    <>
      <path d="M12 2H5C4.45 2 4 2.45 4 3V17C4 17.55 4.45 18 5 18H15C15.55 18 16 17.55 16 17V6L12 2Z" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2V6H16" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10H12" stroke={color} strokeWidth="1.33" strokeLinecap="round" />
      <path d="M8 13H12" stroke={color} strokeWidth="1.33" strokeLinecap="round" />
    </>
  ),
  sparkle: (color) => (
    <>
      <path d="M10 2L11.5 7L17 8L11.5 9L10 14L8.5 9L3 8L8.5 7L10 2Z" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12L15.75 14L18 14.5L15.75 15L15 17L14.25 15L12 14.5L14.25 14L15 12Z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  upload: (color) => (
    /* 위 화살표 + 받침대 = 업로드. arrow-up과 strokeWidth(1.5) 통일. */
    <>
      <path d="M10 13V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8L10 4L14 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Icon({ name, size = "md", color = "currentColor", className, ...rest }: IconProps) {
  const viewBox = "0 0 20 20";
  const px = sizePx[size];
  const ariaLabel = rest["aria-label"];
  const isDecorative = !ariaLabel;

  return (
    <svg
      width={px}
      height={px}
      viewBox={viewBox}
      fill="none"
      role={isDecorative ? undefined : "img"}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={ariaLabel}
      className={cn(className)}
    >
      {icons[name](color)}
    </svg>
  );
}

export type { IconName, IconProps, IconSize };
