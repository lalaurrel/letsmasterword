import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "@/lib/components/layout/Stack/Stack";
import { Inline } from "@/lib/components/layout/Inline/Inline";
import { Button } from "@/lib/components/atoms/Button/Button";
import { ProgressBar } from "@/lib/components/atoms/ProgressBar/ProgressBar";
import { Toggle } from "@/lib/components/atoms/Toggle/Toggle";
import { FileUpload } from "@/lib/components/molecules/FileUpload/FileUpload";
import { Tab } from "@/lib/components/molecules/Tab/Tab";
import { Card } from "@/lib/components/molecules/Card/Card";
import { Flashcard } from "../components/Flashcard";
import { InputHero } from "../components/InputHero";
import { usePronunciation } from "../hooks/usePronunciation";
import { parseText, shuffleCards, type Card as WordCard } from "../lib/parse";

export function VocabularyView() {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [index, setIndex] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [pasteText, setPasteText] = useState("");

  const { playing, source, phonetic, play, prime, stop } = usePronunciation();

  const hasDeck = cards.length > 0;
  const current = hasDeck ? cards[index] : null;

  // 카드 전환 시 발음 처리: 자동재생이면 재생, 아니면 발음기호만 미리 조회
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;

  useEffect(() => {
    if (!current) return;
    if (autoplayRef.current) {
      void play(current.word);
    } else {
      void prime(current.word);
    }
    // index/word가 바뀔 때만 트리거
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cards]);

  // 파일/직접입력 공통 — 텍스트를 파싱해 덱으로 적재
  const loadFromText = useCallback((text: string, emptyMsg: string) => {
    const parsed = parseText(text);
    if (parsed.length === 0) {
      setError(emptyMsg);
      return;
    }
    setError(null);
    setCards(parsed);
    setIndex(0);
    setMeaningVisible(true);
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      setError(null);
      const reader = new FileReader();
      reader.onload = () =>
        loadFromText(
          String(reader.result ?? ""),
          "단어를 찾지 못했습니다. txt 파일 내용을 확인해 주세요.",
        );
      reader.onerror = () => setError("파일을 읽는 중 오류가 발생했습니다.");
      reader.readAsText(file, "UTF-8");
    },
    [loadFromText],
  );

  const loadPasted = useCallback(() => {
    loadFromText(pasteText, "단어를 찾지 못했습니다. 입력한 내용을 확인해 주세요.");
  }, [loadFromText, pasteText]);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0 || next >= cards.length) return i;
        return next;
      });
    },
    [cards.length],
  );

  const onShuffle = useCallback(() => {
    setCards((c) => shuffleCards(c));
    setIndex(0);
  }, []);

  const onNewFile = useCallback(() => {
    stop();
    setCards([]);
    setIndex(0);
    setError(null);
  }, [stop]);

  const toggleMeaning = useCallback(() => {
    if (!current?.meaning) return;
    setMeaningVisible((v) => !v);
  }, [current]);

  // 키보드 단축키
  useEffect(() => {
    if (!hasDeck) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT")) return;
      switch (e.key) {
        case "ArrowLeft":
          go(-1);
          break;
        case "ArrowRight":
          go(1);
          break;
        case " ":
          e.preventDefault();
          if (current) void play(current.word);
          break;
        case "Enter":
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          toggleMeaning();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasDeck, current, go, play, toggleMeaning]);

  const progress = hasDeck ? ((index + 1) / cards.length) * 100 : 0;

  if (!hasDeck) {
    /* ── 입력 화면 (중앙 정렬 · 카드형) ── */
    return (
      <div className="flex w-full flex-col items-center pt-10 sm:pt-16">
        <div className="w-full max-w-[560px]">
          <Stack gap="lg" align="center">
            <InputHero
              emoji="📚"
              title="Vocabulary"
              subtitle="txt 파일을 올리거나 직접 입력하면 카드 하나씩 보여주고 미국식 발음으로 읽어줍니다."
            />

            <Card className="w-full !p-5 sm:!p-6">
              <Stack gap="md">
                <Tab
                  tabs={[
                    { label: "파일 업로드", value: "file" },
                    { label: "직접 입력", value: "text" },
                  ]}
                  activeTab={inputMode}
                  onChange={(v) => {
                    setInputMode(v as "file" | "text");
                    setError(null);
                  }}
                />

                {inputMode === "file" ? (
                  <FileUpload
                    accept=".txt,text/plain"
                    placeholder="txt 단어장을 드래그하거나 클릭하여 업로드"
                    maxSizeLabel={() => "단어 / 뜻 구분자(- , 탭 : 공백)는 자동 인식"}
                    onFileSelect={loadFile}
                  />
                ) : (
                  <Stack gap="sm">
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      rows={7}
                      placeholder={"여기에 단어장을 붙여넣거나 입력하세요.\n\napple - 사과\ndiligent, 부지런한\nresilient: 회복력 있는"}
                      className="w-full resize-y rounded-[12px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] p-4 text-[15px] leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-border-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-selection)] font-[family-name:var(--font-primary)]"
                    />
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      disabled={pasteText.trim().length === 0}
                      onClick={loadPasted}
                    >
                      단어장 만들기
                    </Button>
                  </Stack>
                )}

                {error && (
                  <p className="text-center text-[14px] text-[var(--color-text-error)]">
                    {error}
                  </p>
                )}
              </Stack>
            </Card>
          </Stack>
        </div>
      </div>
    );
  }

  return (
    <Stack gap="md">
      {/* ── 카드 화면 ── */}
      <Inline justify="between" wrap>
        <Inline gap="sm">
          <span className="text-[14px] tabular-nums text-[var(--color-text-secondary)]">
            {index + 1} / {cards.length}
          </span>
          <ProgressBar progress={progress} width={140} label="학습 진행률" />
        </Inline>
        <Inline gap="sm">
          <span className="text-[14px] text-[var(--color-text-secondary)]">자동 재생</span>
          <Toggle checked={autoplay} onChange={setAutoplay} />
        </Inline>
      </Inline>

      {current && (
        <Flashcard
          key={index}
          card={current}
          phonetic={phonetic}
          source={source}
          playing={playing}
          meaningVisible={meaningVisible}
          onReplay={() => void play(current.word)}
          onToggleMeaning={toggleMeaning}
        />
      )}

      {/* 컨트롤 — 모바일: 세로 스택, 데스크탑: 가로 정렬 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          size="md"
          className="sm:flex-none"
          disabled={index === 0}
          onClick={() => go(-1)}
        >
          ← 이전
        </Button>
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="md" onClick={onShuffle}>
            🔀 섞기
          </Button>
          <Button variant="ghost" size="md" showStartIcon iconName="document" onClick={onNewFile}>
            새 파일
          </Button>
        </div>
        <Button
          variant="primary"
          size="md"
          className="sm:flex-none"
          disabled={index === cards.length - 1}
          onClick={() => go(1)}
        >
          다음 →
        </Button>
      </div>

      <p className="text-center text-[13px] text-[var(--color-text-tertiary)]">
        단축키: ← / → 이동 · Space 발음 · Enter 뜻 보기/가리기
      </p>
    </Stack>
  );
}
