import { cn } from "@/lib/cn";

interface AvatarProps {
  /** 프로필 인덱스 (1~5) — 각각 다른 기본 이미지에 매핑. src 지정 시 무시. */
  profile?: 1 | 2 | 3 | 4 | 5;
  /** 커스텀 이미지 URL. 지정 시 profile보다 우선. */
  src?: string;
  /** 이미지 설명 (스크린리더). 미지정/빈값이면 aria-hidden 처리. */
  alt?: string;
  /** 크기 (sm=20 / md=32 / lg=48). 기본 sm. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const profileImages: Record<number, string> = {
  1: "/images/avatar-1.png",
  2: "/images/avatar-2.png",
  3: "/images/avatar-3.png",
  4: "/images/avatar-4.png",
  5: "/images/avatar-5.png",
};

const sizeStyles = {
  sm: "w-5 h-5",   // 20px — list row / inline mention (UpdateRow, ChatBubble, Navbar 기본)
  md: "w-8 h-8",   // 32px — chat 헤더 등 중간
  lg: "w-12 h-12", // 48px — MentorCard 등 prominent
};

export function Avatar({
  profile = 1,
  src,
  alt,
  size = "sm",
  className,
}: AvatarProps) {
  const imageSrc = src || profileImages[profile];
  const isDecorative = alt === undefined || alt === "";

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex-shrink-0",
        sizeStyles[size],
        className,
      )}
    >
      <img
        src={imageSrc}
        alt={isDecorative ? "" : alt}
        aria-hidden={isDecorative ? true : undefined}
        role={isDecorative ? "presentation" : "img"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export type { AvatarProps };
