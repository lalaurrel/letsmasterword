import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 브라우저 내장 음성인식(Web Speech API) 훅 — AI/유료 API 호출 없음.
 * - transcript: 지금까지 인식된 전체 텍스트(확정 + 잠정)
 * - listening: 현재 듣는 중인지
 * - supported: 브라우저 지원 여부
 * 마이크로 들은 말을 텍스트로 변환만 한다(어떤 단어를 말했는지). 매칭/색칠은 호출부에서.
 */
export function useSpeechRecognition(lang = "en-US") {
  const Ctor =
    typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;
  const supported = !!Ctor;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recogRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");
  // 사용자가 멈추지 않았는데 엔진이 onend로 끊기면 자동 재시작하기 위한 플래그
  const wantListeningRef = useRef(false);

  const ensureRecognizer = useCallback(() => {
    if (!Ctor) return null;
    if (recogRef.current) return recogRef.current;

    const recog = new Ctor();
    recog.lang = lang;
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0]?.transcript ?? "";
        if (r.isFinal) finalRef.current += " " + text;
        else interim += " " + text;
      }
      setTranscript((finalRef.current + " " + interim).trim());
    };

    recog.onerror = (e: SpeechRecognitionErrorEvent) => {
      // no-speech/aborted 등은 치명적이지 않음 — 권한 거부만 표시
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("마이크 권한이 필요합니다. 브라우저에서 마이크를 허용해 주세요.");
        wantListeningRef.current = false;
        setListening(false);
      }
    };

    recog.onend = () => {
      // 의도적으로 멈춘 게 아니면 계속 듣도록 재시작
      if (wantListeningRef.current) {
        try {
          recog.start();
        } catch {
          /* 이미 시작된 경우 등 무시 */
        }
      } else {
        setListening(false);
      }
    };

    recogRef.current = recog;
    return recog;
  }, [Ctor, lang]);

  const start = useCallback(() => {
    const recog = ensureRecognizer();
    if (!recog) return;
    setError(null);
    wantListeningRef.current = true;
    setListening(true);
    try {
      recog.start();
    } catch {
      /* 이미 실행 중이면 무시 */
    }
  }, [ensureRecognizer]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    setListening(false);
    recogRef.current?.stop();
  }, []);

  /** 인식 텍스트 초기화(본문/문장 다시 시작 시). */
  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
  }, []);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      recogRef.current?.abort();
    };
  }, []);

  return { supported, listening, transcript, error, start, stop, reset };
}
