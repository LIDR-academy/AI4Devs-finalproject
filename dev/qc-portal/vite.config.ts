import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

// Vite config. In dev, mirror the production single-origin setup by proxying the
// literal `/streams` path to the streamer service, so the app can call `/streams`
// with no base URL baked into the bundle (see openspec design D-P6).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.STREAMER_PROXY_TARGET ?? "http://localhost:8080";

  return {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/streams": { target, changeOrigin: true },
      },
    },
  };
});
