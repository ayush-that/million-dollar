import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";
  const base = isProd ? "/" : "/";

  return {
    base,
    define: {
      __APP_BASE_URL__: JSON.stringify(
        isProd
          ? "https://million-dollar-chi.vercel.app"
          : "http://localhost:3000"
      ),
    },
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "ui-vendor": ["@nextui-org/react", "framer-motion"],
            "supabase-vendor": ["@supabase/supabase-js"],
            "markdown-vendor": [
              "react-markdown",
              "remark-gfm",
              "remark-math",
              "rehype-katex",
            ],
          },
        },
      },
    },
  };
});
