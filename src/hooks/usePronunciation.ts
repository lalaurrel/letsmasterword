import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchPronunciation,
  speakTTS,
  stopPlayback,
  type PlaybackSource,
} from "../lib/pronunciation";

/**
 * 단어 발음 재생 훅.
 * - play(word): mp3 우선 재생, 없으면 TTS 폴백
 * - prime(word): 재생 없이 발음기호만 미리 조회(카드 전환 시)
 * - 현재 단어의 발음기호/재생상태/소스를 노출
 */
export function usePronunciation() {
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState<PlaybackSource>(null);
  const [phonetic, setPhonetic] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 비동기 조회가 늦게 도착했을 때 현재 단어와 다르면 무시하기 위한 토큰
  const tokenRef = useRef(0);

  const stop = useCallback(() => {
    stopPlayback(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }, []);

  const fallbackTTS = useCallback((word: string) => {
    setSource("tts");
    setPlaying(true);
    speakTTS(word, () => setPlaying(false));
  }, []);

  const play = useCallback(
    async (word: string) => {
      stop();
      const myToken = ++tokenRef.current;
      setSource(null);
      setPlaying(true);

      const pron = await fetchPronunciation(word);
      if (myToken !== tokenRef.current) return; // 다른 단어로 넘어감

      setPhonetic(pron.phonetic);

      if (pron.audioUrl) {
        const audio = new Audio(pron.audioUrl);
        audioRef.current = audio;
        setSource("dict");
        audio.onended = () => {
          if (myToken === tokenRef.current) setPlaying(false);
        };
        audio.onerror = () => {
          if (myToken === tokenRef.current) fallbackTTS(word);
        };
        try {
          await audio.play();
          return;
        } catch {
          if (myToken === tokenRef.current) fallbackTTS(word);
          return;
        }
      }
      fallbackTTS(word);
    },
    [stop, fallbackTTS],
  );

  /** 재생 없이 발음기호만 갱신(카드 전환 + 자동재생 off일 때). */
  const prime = useCallback(async (word: string) => {
    const myToken = ++tokenRef.current;
    setSource(null);
    setPhonetic(null);
    const pron = await fetchPronunciation(word);
    if (myToken === tokenRef.current) setPhonetic(pron.phonetic);
  }, []);

  // TTS 음성 목록은 비동기 로드 — 미리 트리거
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const handler = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = handler;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  return { playing, source, phonetic, play, prime, stop };
}
