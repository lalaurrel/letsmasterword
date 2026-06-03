import { cn } from "@/lib/cn";
import type { ViewKey } from "../components/AppNavbar";

interface HomeViewProps {
  onSelect: (key: ViewKey) => void;
}

interface Tile {
  key: ViewKey;
  emoji: string;
  title: string;
  description: string;
  tint: string;
}

const TILES: Tile[] = [
  {
    key: "vocabulary",
    emoji: "📚",
    title: "Vocabulary",
    description: "단어를 카드로 보며 미국식 발음 듣기",
    tint: "var(--palette-tint-purple)",
  },
  {
    key: "speech",
    emoji: "🎤",
    title: "Speech",
    description: "영어 본문을 소리 내어 읽고 체크하기",
    tint: "var(--palette-tint-pink)",
  },
];

/** 홈 — 두 개의 큰 네모 버튼으로 뷰 선택. */
export function HomeView({ onSelect }: HomeViewProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center py-8">
      <div className="w-full max-w-[880px]">
        <div className="mb-8 text-center">
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--color-text-primary)]">
            무엇을 연습할까요?
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-text-tertiary)]">
            아래에서 모드를 선택하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          {TILES.map((tile) => (
            <button
              key={tile.key}
              type="button"
              onClick={() => onSelect(tile.key)}
              className={cn(
                "group flex aspect-square min-h-[300px] flex-col items-center justify-center gap-6 rounded-[28px]",
                "border border-[var(--color-border-subtle)] bg-[var(--color-bg-canvas)] p-10 text-center",
                "shadow-[var(--shadow-section-md)] transition-all duration-200 cursor-pointer",
                "hover:-translate-y-1 hover:border-[var(--color-border-brand)] hover:shadow-[var(--shadow-elevation-mid)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-brand)]",
              )}
            >
              <span
                className="flex h-32 w-32 items-center justify-center rounded-[32px] text-[76px] transition-transform duration-200 group-hover:scale-105"
                style={{ background: tile.tint }}
              >
                {tile.emoji}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="text-[26px] font-bold text-[var(--color-text-primary)]">
                  {tile.title}
                </span>
                <span className="text-[15px] text-[var(--color-text-tertiary)]">
                  {tile.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
