export interface Card {
  word: string;
  meaning: string;
}

/** 한글(완성형 음절 + 자모). */
const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/**
 * 한 줄에서 단어/뜻을 분리. 구분자는 우선순위대로 자동 인식:
 * 탭 → " - "/" – "/" — " → 쉼표 → 콜론 → 2칸 이상 공백.
 * 명시적 구분자가 없으면, 줄에 한글이 있을 때 한글이 시작되는 지점부터 뜻으로 인식
 * (예: "apple 사과", "diligent부지런한"). 그래도 못 나누면 단어만 있는 카드(뜻 빈칸).
 * 빈 줄과 `#` 주석은 null(무시).
 */
export function splitLine(line: string): Card | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const separators: RegExp[] = [
    /\t+/,
    /\s+[-–—]\s+/,
    /\s*,\s*/,
    /\s*:\s*/,
    /\s{2,}/,
  ];

  for (const sep of separators) {
    const parts = trimmed.split(sep);
    if (parts.length >= 2 && parts[0].trim()) {
      return {
        word: parts[0].trim(),
        meaning: parts.slice(1).join(" ").trim(),
      };
    }
  }

  // 구분자 없음 — 한글이 등장하면 그 앞을 단어, 한글부터를 뜻으로
  const m = trimmed.match(HANGUL);
  if (m && m.index !== undefined && m.index > 0) {
    const word = trimmed.slice(0, m.index).trim();
    const meaning = trimmed.slice(m.index).trim();
    if (word) return { word, meaning };
  }

  return { word: trimmed, meaning: "" };
}

/** txt 전체 텍스트를 카드 배열로 파싱. */
export function parseText(text: string): Card[] {
  return text
    .split(/\r?\n/)
    .map(splitLine)
    .filter((c): c is Card => c !== null);
}

/** Fisher–Yates 셔플 (원본 배열 불변, 새 배열 반환). */
export function shuffleCards(cards: Card[]): Card[] {
  const out = cards.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
