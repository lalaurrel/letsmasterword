"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/lib/components/atoms/Avatar/Avatar";
import { Icon } from "@/lib/components/atoms/Icon/Icon";
import { Modal } from "@/lib/components/molecules/Modal/Modal";

interface TutorMessage {
  name: string;
  avatarProfile: 1 | 2 | 3 | 4 | 5;
  message: string;
  time: string;
}

interface TutorPushWidgetProps {
  messages?: TutorMessage[];
  onViewChat?: () => void;
  /** 위젯 제목 (기본 "Tutor"). 다른 컨텍스트에서 재사용 시 외부 제어. */
  title?: string;
  /** 빠른 답변 옵션 (기본 한국어 3개). 빈 배열 전달 시 빠른 답변 영역 숨김. */
  quickReplies?: string[];
  /** 답변 모달 + 안내 라벨 일괄 커스터마이즈. */
  labels?: QuickWidgetLabels;
  /** 사이즈 모드 (additive, 기존 호출처는 "sm"으로 동작 동일).
   *  - "sm"    (기본): 205×224 fixed — Figma 원본 듀얼 페어 안쪽.
   *  - "md"           : 320×224 — col-6 절반 안쪽 등 약간 넓은 컨테이너.
   *  - "fluid"        : w-full, 높이 224 유지 — 부모 폭 fit (P3·P2 등). */
  size?: "sm" | "md" | "fluid";
  className?: string;
}

export interface QuickWidgetLabels {
  replyModalTitle?: string;
  sentTitle?: string;
  sentDescription?: (name: string) => string;
  viewChatButton?: string;
  quickReplyHeading?: string;
  replyPlaceholder?: string;
}

const DEFAULT_LABELS: Required<QuickWidgetLabels> = {
  replyModalTitle: "퀵 답변",
  sentTitle: "전송 완료",
  sentDescription: (name) => `${name}에게 답변을 보냈습니다.`,
  viewChatButton: "대화 내역 보기",
  quickReplyHeading: "빠른 답변",
  replyPlaceholder: "직접 답변을 입력하세요...",
};

const DEFAULT_QUICK_REPLIES = [
  "네, 확인했습니다!",
  "감사합니다, 곧 반영할게요.",
  "질문이 있어요.",
];

const defaultMessages: TutorMessage[] = [
  { name: "Sarah Kim", avatarProfile: 1, message: "포트폴리오 3차 수정본 확인했어요. 피드백 남겼으니 확인해주세요!", time: "10m" },
  { name: "Yuna Lee", avatarProfile: 3, message: "다음 세션 전에 Resume 최종본 올려주실 수 있을까요?", time: "2h" },
];

const SIZE_CLASS = {
  sm: "w-[205px] h-[224px]",
  md: "w-[320px] h-[224px]",
  fluid: "w-full h-[224px]",
} as const;

export function QuickWidget({
  messages = defaultMessages,
  onViewChat,
  title = "Tutor",
  quickReplies = DEFAULT_QUICK_REPLIES,
  labels: labelsProp,
  size = "sm",
  className,
}: TutorPushWidgetProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [replyTarget, setReplyTarget] = useState<TutorMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sent, setSent] = useState(false);

  const handleQuickReply = (text: string) => setReplyText(text);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setReplyTarget(null);
      setReplyText("");
    }, 1200);
  };

  return (
    <>
      <div
        className={cn(
          SIZE_CLASS[size],
          "pt-5 pb-2 px-2 rounded-[48px] bg-[var(--color-bg-subtle)] flex flex-col gap-[10px]",
          className,
        )}
      >
        <div className="px-6 flex items-center justify-between">
          <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)] tracking-[-0.3125px] leading-[36px]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onViewChat}
            className="w-9 h-9 flex items-center justify-center rounded-[20px] bg-[var(--color-bg-surface)] cursor-pointer"
          >
            <Icon name="plus" size="lg" color="var(--color-icon-secondary)" />
          </button>
        </div>

        <div className="flex-1 rounded-[40px] bg-white p-3 flex flex-col overflow-hidden">
          {messages.slice(0, 2).map((msg, i) => (
            <div key={i}>
              {i > 0 && <div className="h-px bg-[var(--color-bg-subtle)] mx-2" />}
              <div
                className="flex gap-2 p-2.5 cursor-pointer transition-opacity hover:opacity-70"
                onClick={() => setReplyTarget(msg)}
              >
                <Avatar profile={msg.avatarProfile} className="!w-7 !h-7 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[length:var(--text-overline)] font-medium text-[var(--color-text-primary)] truncate">{msg.name}</span>
                    <span className="text-[9px] text-[var(--color-text-disabled)] flex-shrink-0">{msg.time}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] leading-[14px] line-clamp-2">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 퀵 답변 모달 */}
      <Modal
        isOpen={replyTarget !== null}
        onClose={() => { setReplyTarget(null); setReplyText(""); setSent(false); }}
        title={labels.replyModalTitle}
        size="sm"
      >
        {replyTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 p-3 rounded-[12px] bg-[var(--color-bg-surface)]">
              <Avatar profile={replyTarget.avatarProfile} className="!w-9 !h-9 flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-primary)]">{replyTarget.name}</span>
                  <span className="text-[length:var(--text-overline)] text-[var(--color-text-disabled)]">{replyTarget.time} ago</span>
                </div>
                <p className="text-[length:var(--text-sm-alt)] text-[var(--color-text-tertiary)] leading-[20px]">{replyTarget.message}</p>
              </div>
            </div>

            {sent ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-success)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10L8.5 13.5L15 7" stroke="var(--color-text-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[14px] font-medium text-[var(--color-text-primary)]">{labels.sentTitle}</span>
                <span className="text-[12px] text-[var(--color-text-disabled)]">{labels.sentDescription(replyTarget.name)}</span>
                <button
                  type="button"
                  onClick={() => { setReplyTarget(null); setSent(false); onViewChat?.(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-bg-surface)] text-[length:var(--text-sm-alt)] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer mt-1"
                >
                  {labels.viewChatButton}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="var(--color-icon-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] text-[var(--color-text-disabled)]">{labels.quickReplyHeading}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickReplies.map((text) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => handleQuickReply(text)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[12px] transition-colors cursor-pointer",
                          replyText === text
                            ? "bg-[var(--color-bg-inverse)] text-white"
                            : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]",
                        )}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={labels.replyPlaceholder}
                    className="w-full h-[44px] rounded-[12px] border-[1.5px] border-[var(--color-border-default)] bg-white text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] px-4 pr-12 outline-none focus:border-[var(--color-border-brand)] focus:border-2 font-[family-name:var(--font-primary)]"
                    onKeyDown={(e) => { if (e.key === "Enter" && replyText.trim()) handleSend(); }}
                  />
                  {replyText.trim() && (
                    <button
                      type="button"
                      onClick={handleSend}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--color-bg-inverse)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-text-secondary)] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 2L6 8M12 2L8.5 12L6 8M12 2L2 5.5L6 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export type { TutorMessage, TutorPushWidgetProps };
