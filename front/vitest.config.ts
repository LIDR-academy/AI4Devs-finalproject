/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Standalone Vitest config. The app's vite.config.ts uses the @lovable.dev
// wrapper (which bundles SSR/nitro plugins not wanted in unit tests), so tests
// run on a minimal React + tsconfig-paths setup with a jsdom environment.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
});
