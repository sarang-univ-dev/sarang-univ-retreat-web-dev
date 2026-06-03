import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// alias `@` -> ./src, matching tsconfig paths (`@/*` -> `./src/*`).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**", "**/node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
