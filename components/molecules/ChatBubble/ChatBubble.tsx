import { cn } from "@/lib/cn";
import { Avatar } from "@/lib/components/atoms/Avatar/Avatar";

interface ChatBubbleProps {
  /** "ai" = 좌측 정렬 (회색 배경) / "user" = 우측 정렬 (검정 배경) */
  variant: "ai" | "user";
  /** 메시지 텍스트 */
  message: string;
  /** 보낸 시각 (예: "오후 3:24") */
  time?: string;
  /** 아바타 프로필 (ai variant에서만 노출) */
  avatarProfile?: 1 | 2 | 3 | 4 | 5;
  avatarSrc?: string;
  /** 발신자 이름 (ai variant에서만 노출) */
  name?: string;
  /** 아바타/이름 숨김 (연속 메시지일 때) */
  hideHeader?: boolean;
  className?: string;
}

export function ChatBubble({
  variant,
  message,
  time,
  avatarProfile = 1,
  avatarSrc,
  name,
  hideHeader = false,
  className,
}: ChatBubbleProps) {
  const isAi = variant === "ai";

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[480px]",
        isAi ? "self-start" : "self-end flex-row-reverse",
        className,
      )}
    >
      {isAi && !hideHeader && (
        <Avatar profile={avatarProfile} src={avatarSrc} />
      )}
      {isAi && hideHeader && <div className="w-[40px] shrink-0" />}

      <div className={cn("flex flex-col gap-1", isAi ? "items-start" : "items-end")}>
        {isAi && name && !hideHeader && (
          <span className="text-[12px] font-medium text-[var(--color-text-tertiary)] px-1">
            {name}
          </span>
        )}

        <div className="flex items-end gap-2">
          {!isAi && time && (
            <span className="text-[length:var(--text-overline)] text-[var(--color-text-disabled)] mb-1 shrink-0">
              {time}
            </span>
          )}

          <div
            className={cn(
              "px-4 py-2.5 text-[14px] leading-[20px] tracking-[-0.28px] break-words",
              isAi
                ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-tl-[4px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px]"
                : "bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] rounded-tl-[16px] rounded-tr-[4px] rounded-bl-[16px] rounded-br-[16px]",
            )}
          >
            {message}
          </div>

          {isAi && time && (
            <span className="text-[length:var(--text-overline)] text-[var(--color-text-disabled)] mb-1 shrink-0">
              {time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export type { ChatBubbleProps };
