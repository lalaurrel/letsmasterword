import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// 디자인 시스템 컴포넌트는 `@/lib/...` 경로로 서로를 참조한다.
// 별칭을 다음과 같이 매핑한다(구체적인 것 우선):
//   @/lib/components/*  → ./components/*
//   @/lib/*             → ./lib/*           (cn, sizeScale, tokens)
//   @/*                 → ./src/*
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/lib\/components\//, replacement: r("./components/") },
      { find: /^@\/lib\//, replacement: r("./lib/") },
      { find: /^@\//, replacement: r("./src/") },
    ],
  },
});
