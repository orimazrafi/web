/// <reference types="vitest/config" />
import { defineConfig } from "vite";

/** CI-only config: unit tests only, no Storybook/Playwright. */
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/*.stories.*"],
  },
});
