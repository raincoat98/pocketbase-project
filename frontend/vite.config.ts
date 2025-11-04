import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT) || 4701,
    open: true,
    host: true,
    // 개발 환경에서 PocketBase API 프록시 설정
    proxy: {
      "/api": {
        target: "http://localhost:8890",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
