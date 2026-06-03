import { useMemo, useState } from "react";
import { Stack } from "@/lib/components/layout/Stack/Stack";
import { Inline } from "@/lib/components/layout/Inline/Inline";
import { Button } from "@/lib/components/atoms/Button/Button";
import { ProgressBar } from "@/lib/components/atoms/ProgressBar/ProgressBar";
import { EmptyState } from "@/lib/components/atoms/EmptyState/EmptyState";
import { Card } from "@/lib/components/molecules/Card/Card";
import { InputHero } from "../components/InputHero";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { parsePassage, computeProgress } from "../lib/reading";

const SAMPLE =
  "The sun rises in the east.\nLearning English is a wonderful journey.\nPractice makes perfect, so read every day.";

export function SpeechView() {
  const [draft, setDraft] = useState("");
  const [passage, setPassage] = useState<string | null>(null);

  const { supported, listening, transcript, error, start, stop, reset } =
    useSpeechRecognition("en-US");

  const sentences = useMemo(
    () => (passage ? parsePassage(passage) : []),
    [passage],
  );

  const spokenTokens = useMemo(
    () => (transcript ? transcript.split(/\s+/) : []),
    [transcript],
  );

  const progress = useMemo(
    () => computeProgress(spokenTokens, sentences),
    [spokenTokens, sentences],
  );

  const doneCount = progress.completed.filter(Boolean).length;
  const allDone = sentences.length > 0 && doneCount === sentences.length;

  const beginPassage = () => {
    const text = draft.trim();
    if (!text) return;
    setPassage(text);
    reset();
  };

  const restart = () => {
    stop();
    reset();
  };

  const newPassage = () => {
    stop();
    reset();
    setPassage(null);
  };

  if (!supported) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          iconName="message"
          title="이 브라우저는 음성 인식을 지원하지 않아요"
          description="Chrome 또는 Edge에서 열어 주세요. (Safari 일부 지원, Firefox 미지원)"
        />
      </div>
    );
  }

  // ── 본문 입력 화면 (중앙 정렬 · 카드형) ──
  if (!passage) {
    return (
      <div className="flex w-full flex-col items-center pt-10 sm:pt-16">
        <div className="w-full max-w-[560px]">
          <Stack gap="lg" align="center">
            <InputHero
              emoji="🎤"
              title="Speech"
              subtitle="영어 본문을 넣고 소리 내어 읽으면, 읽은 단어가 하나씩 초록색으로 바뀌고 문장을 다 읽으면 체크됩니다."
              tint="var(--palette-tint-pink)"
            />

            <Card className="w-full !p-5 sm:!p-6">
              <Stack gap="md">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={7}
                  placeholder={"여기에 영어 본문을 붙여넣거나 입력하세요.\n\n" + SAMPLE}
                  className="w-full resize-y rounded-[12px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] p-4 text-[15px] leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-border-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-selection)] font-[family-name:var(--font-primary)]"
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" size="md" onClick={() => setDraft(SAMPLE)}>
                    예시 넣기
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={draft.trim().length === 0}
                    onClick={beginPassage}
                  >
                    연습 시작
                  </Button>
                </div>
              </Stack>
            </Card>

            <p className="text-center text-[13px] text-[var(--color-text-tertiary)]">
              🎙️ 브라우저 음성인식 사용 — Chrome·Edge 권장, 마이크 권한 필요.
            </p>
          </Stack>
        </div>
      </div>
    );
  }

  // ── 연습 화면 ──
  return (
    <Stack gap="md">
      {/* 상단: 진행 + 듣기 토글 */}
      <Inline justify="between" wrap gap="md">
        <Inline gap="sm">
          <span className="text-[14px] tabular-nums text-[var(--color-text-secondary)]">
            {doneCount} / {sentences.length} 문장
          </span>
          <ProgressBar
            progress={sentences.length ? (doneCount / sentences.length) * 100 : 0}
            width={140}
            label="읽기 진행률"
          />
        </Inline>
        <Button
          variant={listening ? "primary" : "outline"}
          size="md"
          showStartIcon
          iconName={listening ? "stop" : "speak"}
          onClick={listening ? stop : start}
        >
          {listening ? "듣는 중… (중지)" : "🎤 읽기 시작"}
        </Button>
      </Inline>

      {error && (
        <p className="text-[14px] text-[var(--color-text-error)]">{error}</p>
      )}

      {/* 본문 — 문장별 카드 */}
      <Stack gap="sm">
        {sentences.map((sentence, si) => {
          const isCurrent = si === progress.currentSentence;
          const isDone = progress.completed[si];
          return (
            <Card
              key={si}
              className={
                isDone
                  ? "!border-[var(--color-text-success)] !bg-[var(--color-bg-success)]"
                  : isCurrent
                    ? "!border-[var(--color-border-brand)]"
                    : ""
              }
            >
              <Inline gap="md" align="start" className="!items-start">
                {/* 번호 / 체크 */}
                <div
                  className={
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-semibold " +
                    (isDone
                      ? "bg-[var(--color-text-success)] text-white"
                      : isCurrent
                        ? "bg-[var(--color-bg-inverse)] text-white"
                        : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]")
                  }
                >
                  {isDone ? "✓" : si + 1}
                </div>

                {/* 문장 단어들 */}
                <p className="text-[18px] sm:text-[22px] leading-[1.6] flex flex-wrap gap-x-2 gap-y-1">
                  {sentence.words.map((w, wi) => {
                    const read = progress.readFlags[si][wi];
                    const isNext =
                      isCurrent && wi === progress.currentWord && listening;
                    return (
                      <span
                        key={wi}
                        className={
                          "transition-colors duration-150 " +
                          (read
                            ? "text-[var(--color-text-success)] font-semibold"
                            : isNext
                              ? "text-[var(--color-text-primary)] underline decoration-2 underline-offset-4"
                              : "text-[var(--color-text-disabled)]")
                        }
                      >
                        {w.text}
                      </span>
                    );
                  })}
                </p>
              </Inline>
            </Card>
          );
        })}
      </Stack>

      {allDone && (
        <div className="rounded-[16px] bg-[var(--color-bg-success)] p-4 text-center text-[16px] font-semibold text-[var(--color-text-success)]">
          🎉 본문을 모두 읽었어요!
        </div>
      )}

      {/* 컨트롤 */}
      <Inline gap="sm" justify="between">
        <Button variant="ghost" size="md" onClick={restart}>
          ↻ 처음부터
        </Button>
        <Button variant="ghost" size="md" showStartIcon iconName="document" onClick={newPassage}>
          새 본문
        </Button>
      </Inline>

      <p className="text-center text-[13px] text-[var(--color-text-tertiary)]">
        🎤 버튼을 누르고 문장을 순서대로 또박또박 읽어보세요. 인식된 단어가 초록색으로 바뀝니다.
      </p>
    </Stack>
  );
}
