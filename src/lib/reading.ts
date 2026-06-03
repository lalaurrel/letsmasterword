/**
 * 읽기 연습 매칭 로직.
 * 본문을 문장(1,2,3…)으로 나누고, 음성인식으로 들어온 단어들을 본문 단어와
 * 순서대로 대조해 "어디까지 읽었는지"를 계산한다. AI 없음 — 단순 문자열 대조.
 */

export interface ReadingWord {
  /** 화면 표시용 원문 (구두점 포함) */
  text: string;
  /** 비교용 정규화 토큰 */
  norm: string;
}

export interface ReadingSentence {
  /** 문장 원문 */
  text: string;
  words: ReadingWord[];
}

/** 비교용 정규화 — 소문자 + 영문/숫자/어퍼스트로피만 남김. */
export function normToken(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9']/g, "");
}

/** 본문을 문장 배열로 분해(줄바꿈 + .!? 기준). 빈 문장 제거. */
export function parsePassage(text: string): ReadingSentence[] {
  const sentences = text
    .split(/\r?\n/)
    .flatMap((line) => line.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);

  return sentences.map((s) => ({
    text: s,
    words: s
      .split(/\s+/)
      .map((w) => ({ text: w, norm: normToken(w) }))
      .filter((w) => w.norm.length > 0),
  }));
}

/** 두 정규화 토큰이 "같은 단어"로 볼 만한지(부분 일치 허용 — 잠정 인식 대응). */
function tokenMatch(spoken: string, expected: string): boolean {
  if (!spoken || !expected) return false;
  if (spoken === expected) return true;
  if (expected.length >= 3 && spoken.startsWith(expected)) return true;
  if (spoken.length >= 3 && expected.startsWith(spoken)) return true;
  return false;
}

export interface ReadingProgress {
  /** 문장별·단어별 읽음 여부 */
  readFlags: boolean[][];
  /** 문장별 완료 여부 */
  completed: boolean[];
  /** 현재 읽는 문장 인덱스(모두 끝났으면 길이) */
  currentSentence: number;
  /** 현재 문장에서 다음에 읽을 단어 인덱스 */
  currentWord: number;
}

const WINDOW = 5;

/**
 * 들어온 음성 토큰(정규화 전 문자열들)을 본문 단어와 순서대로 대조.
 * 본문 단어를 앞에서부터 훑으며, 각 단어를 음성 토큰 스트림에서 (작은 윈도 내) 찾으면 읽음 처리.
 * 못 찾으면 거기서 멈춤 → 항상 앞에서부터 연속으로만 진행(문장 1→2→3 순서 보장).
 */
export function computeProgress(
  spokenRaw: string[],
  sentences: ReadingSentence[],
): ReadingProgress {
  const spoken = spokenRaw.map(normToken).filter(Boolean);

  // 본문 단어를 평탄화
  const flat: Array<{ si: number; wi: number; norm: string }> = [];
  sentences.forEach((s, si) =>
    s.words.forEach((w, wi) => flat.push({ si, wi, norm: w.norm })),
  );

  const readFlags: boolean[][] = sentences.map((s) => s.words.map(() => false));

  let sp = 0; // 음성 토큰 포인터
  for (const exp of flat) {
    let found = -1;
    for (let k = sp; k < Math.min(spoken.length, sp + WINDOW); k++) {
      if (tokenMatch(spoken[k], exp.norm)) {
        found = k;
        break;
      }
    }
    if (found >= 0) {
      readFlags[exp.si][exp.wi] = true;
      sp = found + 1;
    } else {
      break; // 첫 불일치에서 중단
    }
  }

  const completed = readFlags.map((flags) => flags.length > 0 && flags.every(Boolean));

  let currentSentence = completed.findIndex((c) => !c);
  if (currentSentence === -1) currentSentence = sentences.length;

  let currentWord = 0;
  if (currentSentence < sentences.length) {
    const fw = readFlags[currentSentence].findIndex((f) => !f);
    currentWord = fw === -1 ? 0 : fw;
  }

  return { readFlags, completed, currentSentence, currentWord };
}
