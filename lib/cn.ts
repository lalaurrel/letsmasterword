import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** className 병합 유틸 — clsx로 조건부 결합 후 tailwind-merge로 충돌 클래스 정리. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
