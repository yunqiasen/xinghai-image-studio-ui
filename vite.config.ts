import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 18100),
    proxy: {
      "/api": {
        target: "http://100.126.43.55:18080",
        changeOrigin: true,
      },
      "/v1": {
        target: "http://100.126.43.55:18080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
