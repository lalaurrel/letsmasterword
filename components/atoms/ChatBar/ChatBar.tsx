"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

type ChatBarSize = "sm" | "md" | "lg" | "xl";

interface ChatBarProps {
  placeholder?: string;
  /** 음성 인식 중 표시할 메시지 (기본 "듣고 있어요..."). */
  listeningMessage?: string;
  /** 브라우저가 음성 인식을 지원하지 않을 때 표시할 알림 (기본 한국어). */
  speechNotSupportedMessage?: string;
  onSend?: (text: string) => void;
  /** 최대 폭 (기본 "845px"). "100%" 또는 임의 css 값으로 부모 폭 fit 가능. additive. */
  maxWidth?: string;
  /** 높이 사이즈 (Form Control 스케일 + xl). 기본 "xl" = 기존 76px (Home 위젯 동반용).
   *  세부 화면에서는 sm(36)·md(44)·lg(48)로 축소. 높이·radius·padding·썸네일·텍스트·버튼이 함께 비례. additive. */
  size?: ChatBarSize;
  /** 비활성화 (입력/마이크/전송 모두 차단). additive. */
  disabled?: boolean;
  className?: string;
}

type VoiceState = "idle" | "listening" | "done";

/** 사이즈별 스케일 — height + radius + padding + gap + 썸네일 + 텍스트 + 버튼 + 아이콘 + audio bar 상한. */
const SIZE_STYLE: Record<
  ChatBarSize,
  {
    container: string;
    inner: string;
    thumbBox: string;
    thumbImg: string;
    text: string;
    button: string;
    icon: number;
    barMax: number;
  }
> = {
  sm: {
    container: "h-[36px] rounded-[12px] py-1 pr-1 pl-1 gap-3",
    inner: "h-[28px]",
    thumbBox: "w-[28px] h-[28px]",
    thumbImg: "w-[24px] h-[24px]",
    text: "text-[14px] leading-5",
    button: "w-7 h-7 rounded-[8px]",
    icon: 14,
    barMax: 16,
  },
  md: {
    container: "h-[44px] rounded-[14px] py-1.5 pr-1.5 pl-1.5 gap-4",
    inner: "h-[32px]",
    thumbBox: "w-[34px] h-[34px]",
    thumbImg: "w-[30px] h-[30px]",
    text: "text-[16px] leading-6",
    button: "w-8 h-8 rounded-[10px]",
    icon: 16,
    barMax: 20,
  },
  lg: {
    container: "h-[48px] rounded-[16px] py-2 pr-2 pl-2 gap-5",
    inner: "h-[36px]",
    thumbBox: "w-[38px] h-[38px]",
    thumbImg: "w-[34px] h-[34px]",
    text: "text-[18px] leading-7",
    button: "w-9 h-9 rounded-[12px]",
    icon: 18,
    barMax: 24,
  },
  xl: {
    container: "h-[76px] rounded-[24px] py-3 pr-4 pl-4 gap-8",
    inner: "h-[52px]",
    thumbBox: "w-[50px] h-[52px]",
    thumbImg: "w-[52px] h-[52px]",
    text: "text-[24px] leading-8 tracking-[-0.48px]",
    button: "w-12 h-12 rounded-[16px]",
    icon: 20,
    barMax: 32,
  },
};

export function ChatBar({
  placeholder = "hey! say something to kai, no time to think alone share to",
  listeningMessage = "듣고 있어요...",
  speechNotSupportedMessage = "이 브라우저는 음성 인식을 지원하지 않습니다.",
  onSend,
  maxWidth = "845px",
  size = "xl",
  disabled = false,
  className,
}: ChatBarProps) {
  const sz = SIZE_STYLE[size];
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // 음역폭 분석
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        // 5개 bar로 매핑
        const bars = 5;
        const step = Math.floor(dataArray.length / bars);
        const levels = Array.from({ length: bars }, (_, i) => {
          const val = dataArray[i * step] || 0;
          return Math.min(1, val / 200); // 0~1 정규화
        });
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch {
      // 마이크 권한 거부
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setAudioLevels([0, 0, 0, 0, 0]);
  }, []);

  // 음성 인식
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(speechNotSupportedMessage);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final + interim);
    };

    recognition.onend = () => {
      setVoiceState("done");
      stopAudioAnalysis();
    };

    recognition.onerror = () => {
      setVoiceState("idle");
      stopAudioAnalysis();
      setTranscript("");
    };

    recognition.start();
    setVoiceState("listening");
    setTranscript("");
    startAudioAnalysis();
  }, [startAudioAnalysis, stopAudioAnalysis]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleMicClick = useCallback(() => {
    if (voiceState === "idle") {
      startListening();
    } else if (voiceState === "listening") {
      stopListening();
      // → onend에서 "done"으로 전환됨
    } else if (voiceState === "done") {
      // 초록 상태에서 마이크 다시 누르면 → idle 복귀
      setVoiceState("idle");
      setTranscript("");
    }
  }, [voiceState, startListening, stopListening]);

  // 전송 버튼 클릭
  const handleSend = useCallback(() => {
    if (voiceState === "done") {
      // 음성 전송: 초기화 → 마이크 default, 전송 disabled
      onSend?.(transcript);
      setTranscript("");
      setInputValue("");
      setVoiceState("idle");
    } else if (inputValue.trim()) {
      // 텍스트 전송: 초기화 → 전송 disabled
      onSend?.(inputValue);
      setInputValue("");
    }
  }, [voiceState, inputValue, transcript, onSend]);

  const barColors = [
    "var(--palette-blue-300)",
    "var(--color-brand-secondary)",
    "var(--color-brand-primary)",
    "var(--color-brand-secondary)",
    "var(--palette-blue-300)",
  ];

  // 전송 가능 여부
  const hasSendable = voiceState === "done" || inputValue.trim().length > 0;

  return (
    <div
      style={{ maxWidth }}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex items-center w-full bg-white border transition-colors duration-300",
        sz.container,
        voiceState === "listening" ? "border-[var(--color-border-brand)]" : "border-gray-200",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <div className={cn("flex-1 flex items-center min-w-0", sz.inner)}>
        <div className={cn("flex-shrink-0 flex items-center justify-center", sz.thumbBox)}>
          <img src="/images/kai-thumbnail.png" alt="kAI" className={cn("object-contain", sz.thumbImg)} />
        </div>

        <div className="flex-1 flex items-center px-2 min-w-0">
          {voiceState === "listening" ? (
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-[3px] flex-shrink-0" style={{ height: sz.barMax }}>
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className="w-[4px] rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, level * sz.barMax)}px`,
                      backgroundColor: barColors[i],
                    }}
                  />
                ))}
              </div>
              <span className={cn("font-normal text-[var(--color-text-primary)] truncate", sz.text)}>
                {transcript || listeningMessage}
              </span>
            </div>
          ) : voiceState === "done" && transcript ? (
            <span className={cn("font-normal text-[var(--color-text-primary)] truncate", sz.text)}>
              {transcript}
            </span>
          ) : (
            <input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hasSendable) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className={cn(
                "w-full bg-transparent outline-none font-normal font-[family-name:var(--font-primary)] truncate text-[var(--color-text-primary)] placeholder:text-[var(--color-icon-disabled)]",
                sz.text,
              )}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 마이크 버튼 */}
        <button
          onClick={handleMicClick}
          className={cn(
            "flex items-center justify-center transition-all duration-300 cursor-pointer",
            sz.button,
            voiceState === "listening"
              ? "bg-[var(--color-brand-primary)] text-white animate-pulse"
              : voiceState === "done"
                ? "bg-[var(--color-text-success)] text-white"
                : "bg-[var(--color-bg-inverse)] text-white hover:bg-[var(--color-text-secondary)] active:bg-[var(--color-brand-primary)] active:text-[var(--color-text-primary)]",
          )}
        >
          {voiceState === "listening" ? (
            // 듣는 중: 정지 아이콘
            <svg width={sz.icon} height={sz.icon} viewBox="0 0 20 20" fill="none">
              <rect x="5" y="5" width="10" height="10" rx="2" fill="currentColor" />
            </svg>
          ) : (
            // idle: 마이크 아이콘
            <svg width={sz.icon} height={sz.icon} viewBox="0 0 20 20" fill="none">
              <path d="M10 15.8334V18.3334" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.833 8.33325V9.99992C15.833 11.547 15.2184 13.0307 14.1244 14.1247C13.0305 15.2187 11.5468 15.8333 9.99965 15.8333C8.45256 15.8333 6.96883 15.2187 5.87486 14.1247C4.7809 13.0307 4.16632 11.547 4.16632 9.99992V8.33325" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.4999 4.16681C12.4999 2.7861 11.3806 1.66681 9.99988 1.66681C8.61917 1.66681 7.49988 2.7861 7.49988 4.16681V10.0001C7.49988 11.3809 8.61917 12.5001 9.99988 12.5001C11.3806 12.5001 12.4999 11.3809 12.4999 10.0001V4.16681Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* 전송 버튼 */}
        <button
          onClick={hasSendable ? handleSend : undefined}
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            sz.button,
            !hasSendable
              ? "bg-[var(--color-bg-disabled)] text-[var(--color-text-disabled)] cursor-default"
              : "bg-[var(--color-bg-inverse)] text-white hover:bg-[var(--color-text-secondary)] active:bg-[var(--color-brand-primary)] active:text-[var(--color-text-primary)] cursor-pointer",
          )}
        >
          <svg width={sz.icon} height={sz.icon} viewBox="0 0 20 20" fill="none">
            <path d="M12.1134 18.0716C12.145 18.1505 12.2001 18.2179 12.2711 18.2646C12.3421 18.3113 12.4258 18.3352 12.5107 18.333C12.5957 18.3308 12.678 18.3027 12.7466 18.2524C12.8151 18.2021 12.8666 18.1321 12.8942 18.0516L18.3109 2.2183C18.3375 2.14446 18.3426 2.06455 18.3255 1.98793C18.3085 1.9113 18.2699 1.84113 18.2144 1.78561C18.1589 1.7301 18.0887 1.69154 18.0121 1.67446C17.9355 1.65737 17.8555 1.66246 17.7817 1.68913L1.94837 7.1058C1.86795 7.13338 1.7979 7.1849 1.7476 7.25344C1.69731 7.32199 1.66918 7.40428 1.66701 7.48926C1.66483 7.57425 1.6887 7.65787 1.73542 7.7289C1.78214 7.79993 1.84947 7.85497 1.92837 7.88663L8.53671 10.5366C8.74561 10.6203 8.93542 10.7453 9.09468 10.9043C9.25394 11.0633 9.37936 11.2529 9.46337 11.4616L12.1134 18.0716Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.2116 1.78912L9.09497 10.905" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export type { ChatBarProps, ChatBarSize };
