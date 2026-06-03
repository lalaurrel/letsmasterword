/**
 * Organism 컨테이너 폭 스케일 — 12-그리드 컬럼 폭에 직결되는 6종 사이즈.
 * (col4=411 / col6=628 / col8=845 / col12=1280 / auto / full)
 */
export type OrganismSize = "col4" | "col6" | "col8" | "col12" | "auto" | "full";

const SIZE_WIDTH: Record<Exclude<OrganismSize, "auto" | "full">, string> = {
  col4: "411px",
  col6: "628px",
  col8: "845px",
  col12: "1280px",
};

/**
 * Organism의 max-width 값을 해석한다.
 * - size가 주어지면 그리드 컬럼 폭으로 매핑("auto"→fallback, "full"→100%)
 * - size가 없으면 fallbackMaxWidth(없으면 "100%")
 */
export function resolveContainerWidth(size?: OrganismSize, fallbackMaxWidth?: string): string {
  if (!size || size === "auto") return fallbackMaxWidth ?? "100%";
  if (size === "full") return "100%";
  return SIZE_WIDTH[size];
}
