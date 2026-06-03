interface InputHeroProps {
  emoji: string;
  title: string;
  subtitle: string;
  /** 아이콘 원형 배경 색(토큰 변수). 기본 보라 틴트. */
  tint?: string;
}

/** 입력 화면 상단 히어로 — 큰 아이콘 + 제목 + 설명(중앙 정렬). */
export function InputHero({ emoji, title, subtitle, tint = "var(--palette-tint-purple)" }: InputHeroProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-[20px] text-[32px] shadow-[var(--shadow-section-md)]"
        style={{ background: tint }}
      >
        {emoji}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[var(--color-text-primary)]">
          {title}
        </h2>
        <p className="text-[14px] sm:text-[15px] leading-relaxed text-[var(--color-text-tertiary)] max-w-[420px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
