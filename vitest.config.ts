import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  // tsconfig har jsx: "preserve" (Next transformerer selv) — vitest skal have
  // den automatiske JSX-runtime, så mail-skabelonerne kan testes.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
  },
});
