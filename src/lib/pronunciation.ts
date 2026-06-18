/**
 * 발음 재생 — AI(LLM)·유료 API 호출 없음.
 *  1) 무료 Dictionary API(api.dictionaryapi.dev)에서 실제 사람 녹음 mp3 조회 (미국식 우선)
 *  2) mp3가 없거나 실패하면 브라우저 내장 Web Speech API(TTS)로 폴백
 */

const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

export interface Pronunciation {
  /** 재생할 mp3 URL (없으면 null → TTS 폴백) */
  audioUrl: string | null;
  /** 발음 기호 (예: /ˈæp.əl/) */
  phonetic: string | null;
}

interface DictPhonetic {
  text?: string;
  audio?: string;
}
interface DictEntry {
  phonetic?: string;
  phonetics?: DictPhonetic[];
}

const cache = new Map<string, Pronunciation>();

/** Dictionary API 응답에서 미국식 mp3와 발음기호를 추출. */
function extractPronunciation(data: DictEntry[]): Pronunciation {
  const phonetics: DictPhonetic[] = [];
  let phoneticText: string | null = null;

  for (const entry of data) {
    if (entry.phonetic && !phoneticText) phoneticText = entry.phonetic;
    if (entry.phonetics) phonetics.push(...entry.phonetics);
  }

  const withAudio = phonetics.filter((p) => p.audio && p.audio.trim());
  // 미국식(-us) 우선, 없으면 첫 번째 mp3
  const us = withAudio.find((p) => /-us\.|_us\.|\/us[\/.]/i.test(p.audio!));
  const chosen = us ?? withAudio[0];

  if (!phoneticText) {
    const t = phonetics.find((p) => p.text)?.text;
    if (t) phoneticText = t;
  }

  return { audioUrl: chosen?.audio ?? null, phonetic: phoneticText ?? null };
}

/** 단어의 mp3/발음기호 조회(메모리 캐시). 네트워크 실패 시 빈 결과. */
export async function fetchPronunciation(word: string): Promise<Pronunciation> {
  const key = word.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  let result: Pronunciation = { audioUrl: null, phonetic: null };
  try {
    const res = await fetch(DICT_API + encodeURIComponent(key));
    if (res.ok) {
      const data = (await res.json()) as DictEntry[];
      result = extractPronunciation(data);
    }
  } catch {
    // 네트워크 실패 → TTS 폴백 (기본값 유지)
  }

  cache.set(key, result);
  return result;
}

// 자연스러운(신경망/온라인) 음성 이름 우선순위 — Edge "Natural", Chrome "Google" 등
const VOICE_PREF: RegExp[] = [
  /natural/i,
  /neural/i,
  /online/i,
  /google/i,
  /premium/i,
  /enhanced/i,
  /\bava\b|\bsiri\b|samantha/i,
];

/** 사용 가능한 미국식 영어 음성 중 가장 자연스러운 것을 선택. */
function pickUsVoice(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const enUs = voices.filter((v) => v.lang === "en-US");
  const pool = enUs.length ? enUs : voices.filter((v) => v.lang.startsWith("en"));
  if (!pool.length) return null;

  // 1) 자연스러운 음성 이름 우선
  for (const re of VOICE_PREF) {
    const match = pool.find((v) => re.test(v.name));
    if (match) return match;
  }
  // 2) 온라인(대개 고품질) 음성 우선, 없으면 첫 번째
  return pool.find((v) => !v.localService) ?? pool[0];
}

/**
 * TTS 발음 자연스럽게 보정.
 * - "the" 뒤에 모음으로 시작하는 단어가 오면 "thee"(/ðiː/, "디")로 — 예: "the east" → "thee east"
 *   (모음 소리지만 자음 철자인 "the hour" 등 일부 예외는 보정 안 됨)
 */
function naturalizeForTTS(text: string): string {
  return text.replace(/\b(the)(\s+)(?=[aeiou])/gi, (_m, the: string, sp: string) =>
    (the[0] === "T" ? "Thee" : "thee") + sp,
  );
}

/** 브라우저 내장 TTS로 미국식 발음 재생. onDone은 종료/실패 시 호출. rate: 0.5~1.5(기본 1). */
export function speakTTS(word: string, onDone?: () => void, rate = 1): void {
  if (!("speechSynthesis" in window)) {
    onDone?.();
    return;
  }
  const u = new SpeechSynthesisUtterance(naturalizeForTTS(word));
  u.lang = "en-US";
  u.rate = Math.max(0.5, Math.min(1.5, rate));
  const voice = pickUsVoice();
  if (voice) u.voice = voice;
  u.onend = () => onDone?.();
  u.onerror = () => onDone?.();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/** 현재 재생 중인 오디오/TTS를 모두 중단. */
export function stopPlayback(audio: HTMLAudioElement | null): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * 발음 소스(어떤 수단으로 재생됐는지) — UI 표시용.
 */
export type PlaybackSource = "dict" | "tts" | null;
