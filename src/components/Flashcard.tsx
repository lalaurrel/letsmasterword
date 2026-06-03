import { Card } from "@/lib/components/molecules/Card/Card";
import { Button } from "@/lib/components/atoms/Button/Button";
import { Divider } from "@/lib/components/atoms/Divider/Divider";
import { Tag } from "@/lib/components/atoms/Tag/Tag";
import type { Card as WordCard } from "../lib/parse";
import type { PlaybackSource } from "../lib/pronunciation";

interface FlashcardProps {
  card: WordCard;
  phonetic: string | null;
  source: PlaybackSource;
  playing: boolean;
  meaningVisible: boolean;
  onReplay: () => void;
  onToggleMeaning: () => void;
}

/** 한 장의 단어 카드 — 영단어/발음기호/뜻/발음 버튼. Card 컴포넌트 위에 구성. */
export function Flashcard({
  card,
  phonetic,
  source,
  playing,
  meaningVisible,
  onReplay,
  onToggleMeaning,
}: FlashcardProps) {
  const hasMeaning = card.meaning.trim().length > 0;

  return (
    <Card className="relative !p-6 sm:!p-12 lg:!p-20 min-h-[360px] sm:min-h-[480px] lg:min-h-[600px]">
      {/* 발음 소스 배지 */}
      <div className="absolute top-4 left-4">
        {source === "dict" && <Tag color="purple">🔊 Dictionary 발음</Tag>}
        {source === "tts" && <Tag color="blue">🗣️ 브라우저 음성</Tag>}
      </div>

      {/* 발음 다시 듣기 */}
      <div className="absolute top-3 right-3">
        <Button
          variant="icon"
          size="lg"
          iconName="speak"
          loading={playing}
          onClick={onReplay}
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center gap-5 sm:gap-8 w-full min-h-[260px] sm:min-h-[360px] lg:min-h-[480px]">
        {/* 영단어 */}
        <div className="text-[44px] sm:text-[68px] lg:text-[96px] leading-[1.05] font-bold text-[var(--color-text-primary)] break-words">
          {card.word}
        </div>

        {/* 발음기호 */}
        <div className="text-[18px] sm:text-[24px] lg:text-[30px] text-[var(--color-text-tertiary)] min-h-[1.4em]">
          {phonetic ?? ""}
        </div>

        <Divider size="sm" className="!w-16 sm:!w-24 my-1 sm:my-2" />

        {/* 뜻 */}
        <div
          className="text-[24px] sm:text-[34px] lg:text-[44px] text-[var(--color-text-secondary)] break-words min-h-[1.4em]"
          style={{ visibility: meaningVisible ? "visible" : "hidden" }}
        >
          {hasMeaning ? card.meaning : "(뜻 없음)"}
        </div>

        {hasMeaning && (
          <Button variant="outline" size="sm" onClick={onToggleMeaning}>
            {meaningVisible ? "뜻 가리기 (Enter)" : "뜻 보기 (Enter)"}
          </Button>
        )}
      </div>
    </Card>
  );
}
